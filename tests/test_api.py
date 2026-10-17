"""Contract tests for the read-only API.

The engine is injected so the suite keeps running without PostgreSQL. These tests also
assert the absence of write routes: source creation and crawl launch are not part of the
contract until their own permissions, audit and error states are defined.
"""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from hashscrap.api import create_api
from hashscrap.models import Base
from hashscrap.pipeline import extract_from_item, persist_extraction
from tests.test_pipeline import item_for


def _memory_engine() -> Engine:
    """A single shared connection, because the API is exercised from another thread."""
    return create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )


@pytest.fixture
def client() -> Iterator[TestClient]:
    engine = _memory_engine()
    Base.metadata.create_all(engine)
    with Session(engine) as session:
        result, digest = extract_from_item(item_for("index.html"))
        persisted = persist_extraction(session, result, content_sha256=digest)
        session.commit()
        document_id = str(persisted.document_id)
    with TestClient(create_api(engine)) as test_client:
        test_client.document_id = document_id
        yield test_client
    engine.dispose()


def test_health_reports_the_schema_version(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "schema_version": "1.0"}


def test_summary_counts_match_persisted_rows(client: TestClient) -> None:
    response = client.get("/api/v1/summary")
    assert response.status_code == 200
    payload = response.json()
    detail = client.get(f"/api/v1/documents/{client.document_id}").json()

    assert payload["documents"] == 1
    assert payload["observations"] == len(detail["observations"])
    assert payload["observations_pending_review"] == payload["observations"]
    assert payload["sources"] == 0
    assert payload["entities"] == 0
    assert payload["last_run_at"] is None


def test_documents_expose_provenance_and_are_paginated(client: TestClient) -> None:
    listing = client.get("/api/v1/documents", params={"limit": 1})
    assert listing.status_code == 200
    payload = listing.json()
    assert payload["total"] == 1
    document = payload["items"][0]
    assert document["original_url"] == "https://fixture.example/index.html"
    assert document["media_type"] == "text/html; charset=utf-8"
    assert document["content_sha256"]
    assert document["observations_count"] > 0

    detail = client.get(f"/api/v1/documents/{client.document_id}").json()
    titles = [item for item in detail["observations"] if item["field_name"] == "title"]
    assert titles[0]["normalized_value"] == "Fixture Home"
    assert titles[0]["evidence_ref"]
    assert titles[0]["extractor_version"]


def test_unknown_document_returns_404(client: TestClient) -> None:
    response = client.get("/api/v1/documents/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_limit_is_bounded(client: TestClient) -> None:
    assert client.get("/api/v1/documents", params={"limit": 0}).status_code == 422
    assert client.get("/api/v1/documents", params={"limit": 5000}).status_code == 422
    assert client.get("/api/v1/documents", params={"offset": -1}).status_code == 422


def test_empty_database_reports_zeroes_instead_of_failing() -> None:
    engine = _memory_engine()
    Base.metadata.create_all(engine)
    with TestClient(create_api(engine)) as client:
        summary = client.get("/api/v1/summary").json()
        assert summary == {
            "sources": 0,
            "documents": 0,
            "observations": 0,
            "entities": 0,
            "runs_total": 0,
            "runs_succeeded": 0,
            "runs_failed": 0,
            "observations_pending_review": 0,
            "last_run_at": None,
        }
        assert client.get("/api/v1/documents").json() == {"total": 0, "items": []}
        assert client.get("/api/v1/sources").json() == []
        assert client.get("/api/v1/runs").json() == []
        assert client.get("/api/v1/entities").json() == []
    engine.dispose()


def test_contract_exposes_no_write_route(client: TestClient) -> None:
    for method, path in (
        ("post", "/api/v1/sources"),
        ("post", "/api/v1/runs"),
        ("delete", "/api/v1/documents"),
        ("put", "/api/v1/summary"),
    ):
        response = client.request(method.upper(), path)
        assert response.status_code in {404, 405}, f"{method.upper()} {path} must not exist"
