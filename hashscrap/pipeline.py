"""Composition layer between bounded collection, extraction and persistence.

This module wires existing modules together; it does not replace them. Collection stays
in `hashscrap.crawler`, extraction stays in `hashscrap.extraction`, fingerprints in
`hashscrap.fingerprints` and schema access in `hashscrap.models`.

Bounded-memory contract: when a caller supplies `on_item`, scraped items are handed over
and dropped instead of being accumulated, so response bodies are not retained for the
whole run.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from hashscrap.config import AppConfig, Source
from hashscrap.extraction import ExtractionResult, extract_html
from hashscrap.fingerprints import fingerprint_content
from hashscrap.models import CrawlRun, Document, Observation
from hashscrap.models import Source as SourceRow

DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024


@dataclass(frozen=True, slots=True)
class PersistResult:
    """Outcome of persisting one extraction result. The caller owns the transaction."""

    document_id: UUID
    content_sha256: str
    created: bool
    observations_created: int


@dataclass(frozen=True, slots=True)
class CollectionSummary:
    """Result of one collection persisted to the database."""

    source_id: str
    run_id: UUID
    responses: int
    documents_created: int
    documents_updated: int
    observations_created: int
    failures: int
    error_reasons: tuple[str, ...]

    def to_dict(self) -> dict[str, Any]:
        return {
            "source_id": self.source_id,
            "run_id": str(self.run_id),
            "responses": self.responses,
            "documents_created": self.documents_created,
            "documents_updated": self.documents_updated,
            "observations_created": self.observations_created,
            "failures": self.failures,
            "error_reasons": list(self.error_reasons),
        }


def ensure_source(session: Session, source: Source) -> SourceRow:
    """Insert or refresh the persisted row for a configured source. Caller commits."""
    row = session.scalar(select(SourceRow).where(SourceRow.source_key == source.id))
    policy: dict[str, Any] = {
        "base_url": source.base_url,
        "allowed_hosts": list(source.allowed_hosts),
        "limits": source.limits.model_dump(),
    }
    if row is None:
        row = SourceRow(
            source_key=source.id,
            source_type=source.type,
            base_url=source.base_url,
            policy_config=policy,
            enabled=source.enabled,
        )
        session.add(row)
        session.flush()
        return row
    row.source_type = source.type
    row.base_url = source.base_url
    row.policy_config = policy
    row.enabled = source.enabled
    session.flush()
    return row


def extract_from_item(
    item: Mapping[str, Any],
    *,
    max_body_bytes: int = DEFAULT_MAX_BODY_BYTES,
) -> tuple[ExtractionResult, str]:
    """Convert one scraped item into an extraction result plus its content fingerprint.

    The body is checked before parsing, so an oversized response is rejected without
    allocating an extraction result.
    """
    try:
        url = item["url"]
        status_code = item["status"]
        content_type = item["content_type"]
        body = item["body"]
    except KeyError as exc:
        raise ValueError(f"scraped item is missing field: {exc.args[0]}") from exc
    if not isinstance(url, str) or not url:
        raise ValueError("scraped item URL must be a non-empty string")
    if not isinstance(body, bytes):
        raise ValueError("scraped item body must be bytes")
    if len(body) > max_body_bytes:
        raise ValueError("response body exceeds extraction size limit")

    fetched_at = item.get("fetched_at")
    if not isinstance(fetched_at, datetime):
        fetched_at = datetime.now(UTC)

    result = extract_html(
        url=url,
        status_code=int(status_code),
        content_type=str(content_type),
        body=body,
        fetched_at=fetched_at,
        max_body_bytes=max_body_bytes,
    )
    return result, fingerprint_content(body)


def persist_extraction(
    session: Session,
    result: ExtractionResult,
    *,
    content_sha256: str,
    source_id: UUID | None = None,
    run_id: UUID | None = None,
) -> PersistResult:
    """Persist one document and its new observations, preserving provenance.

    Idempotent: re-persisting the same original URL updates `last_seen_at` and the
    fingerprint instead of duplicating documents or observations. The caller owns the
    surrounding transaction and must commit it.
    """
    if len(content_sha256) != 64:
        raise ValueError("content_sha256 must be a 64-character hex digest")

    document_record = result.document
    existing = session.scalar(
        select(Document).where(Document.original_url == document_record.original_url)
    )
    now = datetime.now(UTC)

    if existing is None:
        existing = Document(
            id=document_record.id,
            source_id=source_id,
            run_id=run_id,
            original_url=document_record.original_url,
            canonical_url=document_record.canonical_url,
            content_sha256=content_sha256,
            media_type=document_record.content_type,
            status_code=document_record.status_code,
            first_seen_at=now,
            last_seen_at=now,
        )
        session.add(existing)
        created = True
    else:
        existing.canonical_url = document_record.canonical_url
        existing.content_sha256 = content_sha256
        existing.media_type = document_record.content_type
        existing.status_code = document_record.status_code
        if existing.source_id is None and source_id is not None:
            existing.source_id = source_id
        if existing.run_id is None and run_id is not None:
            existing.run_id = run_id
        existing.last_seen_at = now
        created = False

    session.flush()

    known = {
        (row.field_name, row.evidence_ref, row.normalized_value)
        for row in session.scalars(
            select(Observation).where(Observation.document_id == existing.id)
        )
    }
    observations_created = 0
    for observation in result.observations:
        key = (observation.field_name, observation.evidence_ref, observation.normalized_value)
        if key in known:
            continue
        known.add(key)
        session.add(
            Observation(
                document_id=existing.id,
                source_id=source_id,
                run_id=run_id,
                observed_at=observation.observed_at,
                field_name=observation.field_name,
                raw_value=observation.raw_value,
                normalized_value=observation.normalized_value,
                extractor=observation.extractor,
                extractor_version=observation.extractor_version,
                evidence_ref=observation.evidence_ref,
                validation_status=observation.validation_status,
            )
        )
        observations_created += 1

    session.flush()
    return PersistResult(
        document_id=existing.id,
        content_sha256=content_sha256,
        created=created,
        observations_created=observations_created,
    )


def collect_and_persist(
    session: Session,
    config: AppConfig,
    source_id: str,
    start_urls: list[str],
) -> CollectionSummary:
    """Collect one bounded source, extract and persist every response.

    A `crawl_jobs` row and a `crawl_runs` row record the outcome. The job key is unique
    per invocation: deduplicating queued work belongs to the durable worker, not to a
    single command run. A rejected document is rolled back to a savepoint and never
    aborts the run. The caller owns the surrounding transaction.
    """
    import hashlib

    from hashscrap.crawler import collect
    from hashscrap.jobs import create_job, transition_job
    from hashscrap.source_registry import SourceRegistry

    source = SourceRegistry(config).get_enabled(source_id)
    source_row = ensure_source(session, source)
    max_body_bytes = source.limits.max_response_bytes

    started_at = datetime.now(UTC)
    job_key = hashlib.sha256(
        f"{source_id}|{'|'.join(sorted(start_urls))}|{started_at.isoformat()}".encode()
    ).hexdigest()
    job, _ = create_job(
        session,
        input_url=start_urls[0],
        idempotency_key=job_key,
        source_id=source_row.id,
        max_attempts=1,
    )
    transition_job(session, job.id, "running")

    run = CrawlRun(job_id=job.id, status="running", started_at=started_at)
    session.add(run)
    session.flush()

    documents_created = 0
    documents_updated = 0
    observations_created = 0
    bytes_received = 0
    failures = 0
    error_reasons: list[str] = []

    def on_item(item: dict[str, Any]) -> None:
        nonlocal documents_created, documents_updated, observations_created, bytes_received
        nonlocal failures
        bytes_received += int(item.get("body_bytes", 0))
        try:
            with session.begin_nested():
                result, digest = extract_from_item(item, max_body_bytes=max_body_bytes)
                persisted = persist_extraction(
                    session,
                    result,
                    content_sha256=digest,
                    source_id=source_row.id,
                    run_id=run.id,
                )
        except ValueError:
            failures += 1
            error_reasons.append("extraction_rejected")
            return
        if persisted.created:
            documents_created += 1
        else:
            documents_updated += 1
        observations_created += persisted.observations_created

    try:
        result = collect(config, source_id, start_urls, on_item=on_item)
    except Exception:
        run.status = "failed"
        run.finished_at = datetime.now(UTC)
        run.failed_count = 1
        run.bytes_received = bytes_received
        with session.begin_nested():
            transition_job(session, job.id, "failed", error_code="collection_error")
        session.flush()
        raise

    total_failures = result.failures + failures
    run.status = "failed" if total_failures else "succeeded"
    run.finished_at = datetime.now(UTC)
    run.fetched_count = result.responses
    run.failed_count = total_failures
    run.bytes_received = bytes_received
    with session.begin_nested():
        transition_job(
            session,
            job.id,
            "failed" if total_failures else "succeeded",
            error_code="collection_incomplete" if total_failures else None,
        )
    session.flush()

    return CollectionSummary(
        source_id=source_id,
        run_id=run.id,
        responses=result.responses,
        documents_created=documents_created,
        documents_updated=documents_updated,
        observations_created=observations_created,
        failures=total_failures,
        error_reasons=tuple([*result.error_reasons, *error_reasons]),
    )
