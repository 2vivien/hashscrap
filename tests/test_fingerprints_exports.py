from __future__ import annotations

import csv
import io
import json
from datetime import UTC, datetime

from hashscrap.exports import export_csv, export_jsonl
from hashscrap.extraction import DocumentRecord, ExtractionResult, Observation
from hashscrap.fingerprints import DeduplicationIndex, fingerprint_content


def _result(url: str, *, title: str = "Example", status: int = 200) -> ExtractionResult:
    document = DocumentRecord(
        original_url=url,
        status_code=status,
        content_type="text/html; charset=utf-8",
        fetched_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    observation = Observation(
        document_id=document.id,
        field_name="title",
        raw_value=title,
        normalized_value=title,
        observed_at=document.fetched_at,
        evidence_ref="css:title",
        validation_status="unreviewed",
    )
    return ExtractionResult(document=document, observations=[observation])


def test_sha256_fingerprint_is_stable_and_changes_with_body() -> None:
    assert fingerprint_content("café".encode()) == fingerprint_content("café".encode())
    assert fingerprint_content(b"version 1") != fingerprint_content(b"version 2")


def test_deduplication_reports_url_and_content_without_dropping_documents() -> None:
    index = DeduplicationIndex()
    first = _result("https://example.test/a", title="same")
    same_url = _result("https://EXAMPLE.test:443/a#section", title="different")
    same_body_other_url = _result("https://example.test/b", title="same")

    first_match = index.register(first.document, b"body-one")
    url_match = index.register(same_url.document, b"body-two")
    content_match = index.register(same_body_other_url.document, b"body-one")

    assert first_match.url_duplicate_of is None
    assert first_match.content_duplicate_of is None
    assert url_match.url_duplicate_of == first.document.id
    assert url_match.content_duplicate_of is None
    assert content_match.url_duplicate_of is None
    assert content_match.content_duplicate_of == first.document.id


def test_jsonl_is_valid_stable_and_preserves_provenance() -> None:
    result = _result("https://example.test/a", title="Café")
    sources = {result.document.id: "example-source"}
    hashes = {result.document.id: fingerprint_content(b"html")}
    first = export_jsonl([result], source_ids=sources, fingerprints=hashes)
    second = export_jsonl([result], source_ids=sources, fingerprints=hashes)

    assert first == second
    record = json.loads(first)
    assert record["document"]["source_id"] == "example-source"
    assert record["document"]["content_sha256"] == hashes[result.document.id]
    assert record["observations"][0]["evidence_ref"] == "css:title"
    assert record["observations"][0]["validation_status"] == "unreviewed"


def test_csv_escapes_formulas_and_handles_commas_quotes_and_unicode() -> None:
    result = _result("https://example.test/a", title='=HYPERLINK("https://bad.test","Café, test")')
    output = export_csv([result])
    rows = list(csv.DictReader(io.StringIO(output)))

    assert len(rows) == 1
    assert rows[0]["raw_value"].startswith("'=")
    assert "Café, test" in rows[0]["raw_value"]
    assert rows[0]["evidence_ref"] == "css:title"


def test_csv_retains_document_with_no_observations_and_null_fields() -> None:
    document = DocumentRecord(
        original_url="https://example.test/empty",
        canonical_url=None,
        status_code=204,
        fetched_at=datetime(2026, 1, 1, tzinfo=UTC),
    )
    output = export_csv([ExtractionResult(document=document, observations=[])])
    rows = list(csv.DictReader(io.StringIO(output)))

    assert len(rows) == 1
    assert rows[0]["canonical_url"] == ""
    assert rows[0]["observation_id"] == ""
