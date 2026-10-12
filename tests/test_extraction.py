from __future__ import annotations

from datetime import UTC, datetime

import pytest
from pydantic import ValidationError

from hashscrap.extraction import DocumentRecord, Observation, extract_html


def test_extracts_title_description_canonical_and_links_with_provenance() -> None:
    fetched_at = datetime(2026, 10, 12, 10, 0, tzinfo=UTC)
    body = b"""<!doctype html><html><head>
    <title>  Example   Organization </title>
    <meta name="description" content="Public profile">
    <link rel="canonical" href="/profile">
    </head><body><a href="/contact">Contact</a><a href="https://other.example/about">About</a></body></html>"""
    result = extract_html(
        url="https://example.org/original",
        status_code=200,
        content_type="text/html; charset=utf-8",
        body=body,
        fetched_at=fetched_at,
    )
    assert result.document.original_url == "https://example.org/original"
    assert result.document.canonical_url == "https://example.org/profile"
    assert result.document.fetched_at == fetched_at
    fields = {item.field_name: item for item in result.observations if item.field_name != "link"}
    assert fields["title"].normalized_value == "Example Organization"
    assert fields["meta_description"].normalized_value == "Public profile"
    assert fields["canonical_url"].normalized_value == "/profile"
    assert any(item.normalized_value == "https://example.org/contact" for item in result.observations if item.field_name == "link_url")
    assert all(item.document_id == result.document.id for item in result.observations)
    assert all(item.evidence_ref and item.extractor_version for item in result.observations)


def test_original_url_is_preserved_when_canonical_differs() -> None:
    result = extract_html(
        url="https://example.org/path?tracking=1",
        status_code=200,
        content_type="text/html",
        body=b'<html><head><link rel="canonical" href="https://example.org/clean"></head></html>',
    )
    assert result.document.original_url == "https://example.org/path?tracking=1"
    assert result.document.canonical_url == "https://example.org/clean"


def test_non_html_document_has_no_html_observations() -> None:
    result = extract_html(
        url="https://example.org/data.json",
        status_code=200,
        content_type="application/json",
        body=b'{"ok":true}',
    )
    assert result.document.status_code == 200
    assert result.observations == []


def test_rejects_oversized_body_before_parsing() -> None:
    with pytest.raises(ValueError, match="size limit"):
        extract_html(
            url="https://example.org/",
            status_code=200,
            content_type="text/html",
            body=b"x" * 10,
            max_body_bytes=9,
        )


def test_rejects_malformed_document_url() -> None:
    with pytest.raises(ValueError, match="malformed"):
        extract_html(
            url="not a url",
            status_code=200,
            content_type="text/html",
            body=b"<title>Bad URL</title>",
        )


def test_document_and_observation_require_timezone_aware_timestamps() -> None:
    with pytest.raises(ValidationError, match="timezone-aware"):
        DocumentRecord(
            original_url="https://example.org",
            status_code=200,
            fetched_at=datetime(2026, 10, 12),
        )
    with pytest.raises(ValidationError, match="timezone-aware"):
        Observation(
            document_id=DocumentRecord(original_url="https://example.org", status_code=200).id,
            field_name="title",
            raw_value="Title",
            normalized_value="Title",
            observed_at=datetime(2026, 10, 12),
            evidence_ref="css:title",
        )


def test_charset_is_respected_for_html() -> None:
    result = extract_html(
        url="https://example.org/",
        status_code=200,
        content_type="text/html; charset=iso-8859-1",
        body=b"<html><head><title>Caf\xe9</title></head></html>",
    )
    assert next(item for item in result.observations if item.field_name == "title").normalized_value == "Café"
