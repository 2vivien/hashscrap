"""Typed document and observation models with source provenance."""

from __future__ import annotations

from datetime import UTC, datetime
from email.message import Message
from typing import Literal
from urllib.parse import urljoin, urlsplit
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator
from scrapy import Selector

PARSER_NAME = "hashscrap-html"
PARSER_VERSION = "1"


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class DocumentRecord(StrictModel):
    id: UUID = Field(default_factory=uuid4)
    original_url: str = Field(min_length=1, max_length=4096)
    canonical_url: str | None = Field(default=None, max_length=4096)
    status_code: int = Field(ge=100, le=599)
    content_type: str = Field(default="application/octet-stream", max_length=255)
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    parser_name: str = PARSER_NAME
    parser_version: str = PARSER_VERSION

    @field_validator("fetched_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("fetched_at must be timezone-aware")
        return value.astimezone(UTC)


class Observation(StrictModel):
    id: UUID = Field(default_factory=uuid4)
    document_id: UUID
    field_name: str = Field(min_length=1, max_length=120)
    raw_value: str = Field(max_length=20_000)
    normalized_value: str = Field(max_length=20_000)
    observed_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    extractor: str = PARSER_NAME
    extractor_version: str = PARSER_VERSION
    evidence_ref: str = Field(min_length=1, max_length=500)
    validation_status: Literal["unreviewed", "validated", "rejected"] = "unreviewed"

    @field_validator("observed_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("observed_at must be timezone-aware")
        return value.astimezone(UTC)


class ExtractionResult(StrictModel):
    document: DocumentRecord
    observations: list[Observation] = Field(default_factory=list)


def _charset(content_type: str) -> str:
    message = Message()
    message["content-type"] = content_type
    charset = message.get_content_charset()
    return charset or "utf-8"


def _normalize(value: str) -> str:
    return " ".join(value.split())


def _host(url: str) -> str | None:
    try:
        return urlsplit(url).hostname
    except ValueError:
        return None


def extract_html(
    *,
    url: str,
    status_code: int,
    content_type: str,
    body: bytes,
    fetched_at: datetime | None = None,
    max_body_bytes: int = 10 * 1024 * 1024,
) -> ExtractionResult:
    """Extract basic HTML fields while retaining original document provenance.

    This function does not fetch URLs or follow canonical links. Canonical URLs are
    observations supplied by the page, not proof that the original URL can be replaced.
    """
    if len(body) > max_body_bytes:
        raise ValueError("response body exceeds extraction size limit")
    parsed_host = _host(url)
    if not parsed_host:
        raise ValueError("document URL is malformed")
    if content_type.lower().split(";", maxsplit=1)[0].strip() not in {
        "text/html",
        "application/xhtml+xml",
    }:
        document = DocumentRecord(
            original_url=url,
            status_code=status_code,
            content_type=content_type or "application/octet-stream",
            fetched_at=fetched_at or datetime.now(UTC),
        )
        return ExtractionResult(document=document, observations=[])

    try:
        text = body.decode(_charset(content_type), errors="replace")
    except LookupError:
        text = body.decode("utf-8", errors="replace")
    selector = Selector(text=text, type="html")
    canonical_href = selector.css('link[rel~="canonical"]::attr(href)').get()
    canonical_url = (
        urljoin(url, canonical_href.strip()) if canonical_href and canonical_href.strip() else None
    )
    document = DocumentRecord(
        original_url=url,
        canonical_url=canonical_url,
        status_code=status_code,
        content_type=content_type,
        fetched_at=fetched_at or datetime.now(UTC),
    )

    observations: list[Observation] = []

    def add(field_name: str, raw_value: str, evidence_ref: str) -> None:
        normalized = _normalize(raw_value)
        if normalized:
            observations.append(
                Observation(
                    document_id=document.id,
                    field_name=field_name,
                    raw_value=raw_value[:20_000],
                    normalized_value=normalized[:20_000],
                    observed_at=document.fetched_at,
                    evidence_ref=evidence_ref,
                )
            )

    title = "".join(selector.css("title::text").getall())
    add("title", title, "css:title")
    description = selector.css('meta[name="description"]::attr(content)').get()
    if description is not None:
        add("meta_description", description, 'css:meta[name="description"]')

    if canonical_href and canonical_url:
        add("canonical_url", canonical_href, 'css:link[rel="canonical"]')
    for index, href in enumerate(selector.css("a::attr(href)").getall()):
        target = urljoin(url, href.strip())
        if urlsplit(target).scheme in {"http", "https"}:
            add("link", href, f"css:a[href]:{index}")
            add("link_url", target, f"css:a[href]:{index}")

    return ExtractionResult(document=document, observations=observations)
