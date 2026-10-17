"""Tests for the collection → extraction → persistence composition layer.

They use an in-process SQLite database so the suite keeps running without any service,
and they feed the local fixture corpus directly instead of crawling: loopback destinations
are refused by the URL policy and must not be weakened for tests.
"""

from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast

import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session

from hashscrap.config import AppConfig
from hashscrap.extraction import PARSER_NAME
from hashscrap.fingerprints import fingerprint_content
from hashscrap.models import Base, Document, Observation
from hashscrap.models import Source as SourceRow
from hashscrap.pipeline import ensure_source, extract_from_item, persist_extraction

CORPUS = Path(__file__).parent / "fixtures" / "corpus"


def fixture_config() -> AppConfig:
    return AppConfig.model_validate(
        {
            "sources": [
                {
                    "id": "local-fixture",
                    "name": "Local fixture corpus",
                    "base_url": "https://fixture.example",
                    "allowed_hosts": ["fixture.example"],
                }
            ]
        }
    )


@pytest.fixture
def session() -> Iterator[Session]:
    engine = create_engine("sqlite+pysqlite:///:memory:")
    Base.metadata.create_all(engine)
    with Session(engine) as active:
        yield active
    engine.dispose()


def count(session: Session, model: type[Any]) -> int:
    return int(session.scalar(select(func.count()).select_from(model)) or 0)


def item_for(path: str, *, content_type: str = "text/html; charset=utf-8") -> dict[str, object]:
    return {
        "source_id": "local-fixture",
        "url": f"https://fixture.example/{path}",
        "status": 200,
        "content_type": content_type,
        "body": (CORPUS / path).read_bytes(),
        "body_bytes": (CORPUS / path).stat().st_size,
        "fetched_at": datetime(2026, 10, 12, 10, 0, tzinfo=UTC),
    }


def versioned_item(path: str) -> dict[str, object]:
    """Same original URL with a different body: an edited page between two collections."""
    item = item_for(path)
    item["url"] = "https://fixture.example/versioned"
    return item


def as_utc(value: datetime) -> datetime:
    """SQLite stores naive datetimes while PostgreSQL keeps the offset; compare instants."""
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def test_ensure_source_inserts_then_refreshes_a_single_row(session: Session) -> None:
    config = fixture_config()
    source = config.sources[0]

    created = ensure_source(session, source)
    session.commit()
    refreshed = ensure_source(
        session, source.model_copy(update={"base_url": "https://fixture.example/v2"})
    )
    session.commit()

    assert refreshed.id == created.id
    assert count(session, SourceRow) == 1
    assert refreshed.policy_config["allowed_hosts"] == ["fixture.example"]


def test_extract_from_item_returns_result_and_fingerprint() -> None:
    item = item_for("index.html")
    result, digest = extract_from_item(item)

    assert digest == fingerprint_content(cast("bytes", item["body"]))
    assert result.document.original_url == "https://fixture.example/index.html"
    title = next(item for item in result.observations if item.field_name == "title")
    assert title.normalized_value == "Fixture Home"


def test_extract_from_item_rejects_missing_and_oversized_bodies() -> None:
    incomplete = item_for("index.html")
    del incomplete["body"]
    with pytest.raises(ValueError, match="missing field: body"):
        extract_from_item(incomplete)

    oversized = item_for("index.html")
    with pytest.raises(ValueError, match="exceeds extraction size limit"):
        extract_from_item(oversized, max_body_bytes=4)

    typed_wrong = item_for("index.html")
    typed_wrong["body"] = "not bytes"
    with pytest.raises(ValueError, match="body must be bytes"):
        extract_from_item(typed_wrong)


def test_persisting_writes_document_and_observations_with_provenance(session: Session) -> None:
    source = ensure_source(session, fixture_config().sources[0])
    result, digest = extract_from_item(item_for("index.html"))

    persisted = persist_extraction(session, result, content_sha256=digest, source_id=source.id)
    session.commit()

    document = session.get(Document, persisted.document_id)
    assert document is not None
    assert document.content_sha256 == digest
    assert document.source_id == source.id
    assert document.first_seen_at is not None and document.last_seen_at is not None
    observations = session.scalars(
        select(Observation).where(Observation.document_id == persisted.document_id)
    ).all()
    assert observations
    for observation in observations:
        assert observation.evidence_ref
        assert observation.extractor == PARSER_NAME
        assert observation.extractor_version
        assert observation.raw_value
        assert as_utc(observation.observed_at) == datetime(2026, 10, 12, 10, 0, tzinfo=UTC)


def test_repeated_collection_is_idempotent_and_updates_last_seen(session: Session) -> None:
    result, digest = extract_from_item(item_for("index.html"))
    first = persist_extraction(session, result, content_sha256=digest)
    session.commit()
    documents_after_first = count(session, Document)
    observations_after_first = count(session, Observation)

    second = persist_extraction(session, result, content_sha256=digest)
    session.commit()

    assert first.created is True
    assert second.created is False
    assert second.document_id == first.document_id
    assert second.observations_created == 0
    assert count(session, Document) == documents_after_first
    assert count(session, Observation) == observations_after_first


def test_same_url_with_changed_body_updates_fingerprint(session: Session) -> None:
    first_result, first_digest = extract_from_item(versioned_item("version-1.html"))
    first = persist_extraction(session, first_result, content_sha256=first_digest)
    session.commit()

    second_result, second_digest = extract_from_item(versioned_item("version-2.html"))
    second = persist_extraction(session, second_result, content_sha256=second_digest)
    session.commit()

    assert first_digest != second_digest
    assert second.document_id == first.document_id
    assert count(session, Document) == 1
    document = session.get(Document, second.document_id)
    assert document is not None
    assert document.content_sha256 == second_digest


def test_non_html_response_is_stored_without_observations(session: Session) -> None:
    item = item_for("index.html", content_type="application/octet-stream")
    result, digest = extract_from_item(item)

    persisted = persist_extraction(session, result, content_sha256=digest)
    session.commit()

    assert result.observations == []
    assert persisted.observations_created == 0
    document = session.get(Document, persisted.document_id)
    assert document is not None
    assert document.media_type == "application/octet-stream"


def test_charset_and_malformed_documents_are_handled(session: Session) -> None:
    latin1 = item_for("latin1.html", content_type="text/html; charset=iso-8859-1")
    result, _ = extract_from_item(latin1)
    title = next(item for item in result.observations if item.field_name == "title")
    assert title.normalized_value == "Café local"

    malformed = item_for("malformed.html")
    malformed_result, _ = extract_from_item(malformed)
    persisted = persist_extraction(session, malformed_result, content_sha256="a" * 64)
    session.commit()
    assert persisted.created is True


def test_persist_rejects_an_invalid_fingerprint_without_writing(session: Session) -> None:
    result, _ = extract_from_item(item_for("index.html"))

    with pytest.raises(ValueError, match="64-character hex digest"):
        persist_extraction(session, result, content_sha256="not-a-digest")

    assert count(session, Document) == 0
