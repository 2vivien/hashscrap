"""PostgreSQL-backed integration tests for the persistent job lifecycle.

These tests exercise real database constraints (unique idempotency key, status
checks, row locks) that the in-memory unit tests cannot cover. They are skipped
unless ``HASHSCRAP_TEST_DATABASE_URL`` points at a disposable PostgreSQL
instance; no ordinary test run needs a running database or network access.
"""

from __future__ import annotations

import json
import os
from collections.abc import Iterator
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest
from sqlalchemy import create_engine, func, select, text, update
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from hashscrap.cli import main
from hashscrap.jobs import create_job, recover_stale_jobs, transition_job
from hashscrap.models import Base, CrawlJob

TEST_DATABASE_URL = os.environ.get("HASHSCRAP_TEST_DATABASE_URL", "").strip()

pytestmark = pytest.mark.skipif(
    not TEST_DATABASE_URL,
    reason="set HASHSCRAP_TEST_DATABASE_URL to run PostgreSQL-backed job tests",
)


@pytest.fixture(scope="module")
def engine() -> Iterator[Engine]:
    """Create the schema once on the disposable test database."""
    test_engine = create_engine(TEST_DATABASE_URL, pool_pre_ping=True)
    Base.metadata.drop_all(test_engine)
    Base.metadata.create_all(test_engine)
    try:
        yield test_engine
    finally:
        test_engine.dispose()


@pytest.fixture
def session(engine: Engine) -> Iterator[Session]:
    """Yield a session over an empty crawl_jobs table."""
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE TABLE crawl_jobs CASCADE"))
    db_session = Session(engine)
    try:
        yield db_session
    finally:
        db_session.rollback()
        db_session.close()


def _set_updated_at(session: Session, job_id: UUID, when: datetime) -> None:
    """Force updated_at so recovery thresholds do not depend on clock skew."""
    session.execute(update(CrawlJob).where(CrawlJob.id == job_id).values(updated_at=when))
    session.commit()


def test_double_submission_same_key_creates_one_active_job(session: Session) -> None:
    first, created_first = create_job(
        session, input_url="https://example.test/a", idempotency_key="same-key"
    )
    assert created_first is True
    session.commit()

    second, created_second = create_job(
        session, input_url="https://example.test/a", idempotency_key="same-key"
    )
    assert created_second is False
    assert second.id == first.id
    session.commit()

    total = session.scalar(select(func.count()).select_from(CrawlJob))
    active = session.scalar(
        select(func.count()).select_from(CrawlJob).where(CrawlJob.status == "queued")
    )
    assert total == 1
    assert active == 1


def test_different_payload_same_key_is_rejected(session: Session) -> None:
    create_job(session, input_url="https://example.test/a", idempotency_key="payload-key")
    session.commit()

    with pytest.raises(ValueError, match="different job payload"):
        create_job(session, input_url="https://example.test/b", idempotency_key="payload-key")


def test_stale_running_job_is_requeued(session: Session) -> None:
    job, _ = create_job(
        session, input_url="https://example.test/a", idempotency_key="stale-key", max_attempts=3
    )
    session.commit()
    transition_job(session, job.id, "running")
    session.commit()
    _set_updated_at(session, job.id, datetime.now(UTC) - timedelta(hours=1))

    recovered = recover_stale_jobs(session, older_than=datetime.now(UTC) - timedelta(minutes=5))
    session.commit()

    assert recovered == 1
    session.refresh(job)
    assert job.status == "queued"
    assert job.error_code == "worker_interrupted"


def test_recent_running_job_is_left_alone(session: Session) -> None:
    job, _ = create_job(
        session, input_url="https://example.test/a", idempotency_key="recent-key", max_attempts=3
    )
    session.commit()
    transition_job(session, job.id, "running")
    session.commit()
    _set_updated_at(session, job.id, datetime.now(UTC))

    recovered = recover_stale_jobs(session, older_than=datetime.now(UTC) - timedelta(minutes=5))
    session.commit()

    assert recovered == 0
    session.refresh(job)
    assert job.status == "running"


def test_exhausted_running_job_is_failed(session: Session) -> None:
    job, _ = create_job(
        session, input_url="https://example.test/a", idempotency_key="exhausted-key", max_attempts=1
    )
    session.commit()
    transition_job(session, job.id, "running")
    session.commit()
    assert job.attempts == job.max_attempts
    _set_updated_at(session, job.id, datetime.now(UTC) - timedelta(hours=1))

    recovered = recover_stale_jobs(session, older_than=datetime.now(UTC) - timedelta(minutes=5))
    session.commit()

    assert recovered == 1
    session.refresh(job)
    assert job.status == "failed"
    assert job.error_code == "worker_interrupted"


def test_cancel_is_terminal_and_invalid_transitions_rejected(session: Session) -> None:
    job, _ = create_job(session, input_url="https://example.test/a", idempotency_key="cancel-key")
    session.commit()

    with pytest.raises(ValueError, match="invalid job transition"):
        transition_job(session, job.id, "succeeded")

    transition_job(session, job.id, "cancelled")
    session.commit()
    session.refresh(job)
    assert job.status == "cancelled"

    with pytest.raises(ValueError, match="invalid job transition"):
        transition_job(session, job.id, "running")


def test_cli_jobs_status_reports_existing_job(
    session: Session, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    job, _ = create_job(session, input_url="https://example.test/a", idempotency_key="cli-key")
    session.commit()
    job_id = job.id

    monkeypatch.setenv("HASHSCRAP_DATABASE_URL", TEST_DATABASE_URL)
    exit_code = main(["jobs", "status", str(job_id)])

    assert exit_code == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["id"] == str(job_id)
    assert payload["status"] == "queued"


def test_cli_jobs_status_missing_job_exits_2(
    engine: Engine, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setenv("HASHSCRAP_DATABASE_URL", TEST_DATABASE_URL)
    exit_code = main(["jobs", "status", str(uuid4())])

    assert exit_code == 2
    assert "job not found" in capsys.readouterr().err


def test_cli_jobs_recover_requeues_stale_job(
    session: Session, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    job, _ = create_job(
        session, input_url="https://example.test/a", idempotency_key="cli-recover-key"
    )
    session.commit()
    transition_job(session, job.id, "running")
    session.commit()
    _set_updated_at(session, job.id, datetime.now(UTC) - timedelta(hours=1))

    monkeypatch.setenv("HASHSCRAP_DATABASE_URL", TEST_DATABASE_URL)
    exit_code = main(["jobs", "recover", "--stale-after", "60"])

    assert exit_code == 0
    payload = json.loads(capsys.readouterr().out)
    assert payload["recovered"] == 1
    session.refresh(job)
    assert job.status == "queued"
