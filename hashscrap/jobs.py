"""Persistent crawl-job lifecycle and recovery helpers."""
from __future__ import annotations

import re
from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from hashscrap.models import CrawlJob

JOB_STATUSES = frozenset({"queued", "running", "succeeded", "failed", "cancelled"})
_ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    "queued": frozenset({"running", "cancelled"}),
    "running": frozenset({"succeeded", "failed", "cancelled"}),
    "failed": frozenset({"queued"}),
    "succeeded": frozenset(),
    "cancelled": frozenset(),
}
_SAFE_ERROR_CODE = re.compile(r"^[a-z0-9_]{1,80}$")


def create_job(
    session: Session,
    *,
    input_url: str,
    idempotency_key: str,
    source_id: UUID | None = None,
    max_attempts: int = 3,
    priority: int = 0,
) -> tuple[CrawlJob, bool]:
    """Create one queued job, or return the existing job for the same idempotency key.

    Returns (job, created). Reusing a key with a different logical payload is rejected.
    The caller owns the outer transaction and must commit it.
    """
    if not input_url.strip():
        raise ValueError("input_url must not be empty")
    if not idempotency_key.strip() or len(idempotency_key) > 255:
        raise ValueError("idempotency_key must contain 1 to 255 characters")
    if max_attempts < 1:
        raise ValueError("max_attempts must be positive")

    existing = session.scalar(
        select(CrawlJob).where(CrawlJob.idempotency_key == idempotency_key)
    )
    if existing is not None:
        _ensure_same_payload(existing, input_url, source_id, max_attempts, priority)
        return existing, False

    job = CrawlJob(
        input_url=input_url,
        idempotency_key=idempotency_key,
        source_id=source_id,
        max_attempts=max_attempts,
        priority=priority,
        status="queued",
        attempts=0,
    )
    try:
        # Savepoint ensures a concurrent uniqueness conflict does not poison the
        # caller's outer transaction.
        with session.begin_nested():
            session.add(job)
            session.flush()
    except IntegrityError:
        existing = session.scalar(
            select(CrawlJob).where(CrawlJob.idempotency_key == idempotency_key)
        )
        if existing is None:
            raise
        _ensure_same_payload(existing, input_url, source_id, max_attempts, priority)
        return existing, False
    return job, True


def _ensure_same_payload(
    job: CrawlJob,
    input_url: str,
    source_id: UUID | None,
    max_attempts: int,
    priority: int,
) -> None:
    if (
        job.input_url != input_url
        or job.source_id != source_id
        or job.max_attempts != max_attempts
        or job.priority != priority
    ):
        raise ValueError("idempotency key already belongs to a different job payload")


def transition_job(
    session: Session,
    job_id: UUID,
    target_status: str,
    *,
    error_code: str | None = None,
) -> CrawlJob:
    """Apply one allowed transition under a row lock; caller commits the transaction."""
    if target_status not in JOB_STATUSES:
        raise ValueError("unknown job status")
    if error_code is not None and not _SAFE_ERROR_CODE.fullmatch(error_code):
        raise ValueError("error_code must be a lowercase safe identifier")

    with session.begin_nested():
        job = session.scalar(
            select(CrawlJob).where(CrawlJob.id == job_id).with_for_update()
        )
        if job is None:
            raise LookupError("job not found")
        if target_status not in _ALLOWED_TRANSITIONS[job.status]:
            raise ValueError(f"invalid job transition: {job.status} -> {target_status}")
        if target_status == "running":
            if job.attempts >= job.max_attempts:
                raise ValueError("job attempt limit reached")
            job.attempts += 1
            job.error_code = None
        elif target_status == "queued":
            if job.attempts >= job.max_attempts:
                raise ValueError("job attempt limit reached")
            job.error_code = error_code
        elif target_status == "failed":
            job.error_code = error_code or "job_failed"
        else:
            job.error_code = error_code
        job.status = target_status
        session.flush()
    return job


def recover_stale_jobs(session: Session, *, older_than: datetime) -> int:
    """Requeue interrupted jobs or fail exhausted jobs using a locked DB transaction."""
    recovered = 0
    with session.begin_nested():
        jobs = session.scalars(
            select(CrawlJob)
            .where(CrawlJob.status == "running", CrawlJob.updated_at < older_than)
            .with_for_update(skip_locked=True)
        ).all()
        for job in jobs:
            if job.attempts < job.max_attempts:
                job.status = "queued"
            else:
                job.status = "failed"
            job.error_code = "worker_interrupted"
            recovered += 1
        session.flush()
    return recovered
