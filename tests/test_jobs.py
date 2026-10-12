from __future__ import annotations

import pytest

from hashscrap.jobs import _ALLOWED_TRANSITIONS, JOB_STATUSES, _ensure_same_payload


def test_job_statuses_and_transition_map_are_explicit() -> None:
    assert JOB_STATUSES == {"queued", "running", "succeeded", "failed", "cancelled"}
    assert "succeeded" not in _ALLOWED_TRANSITIONS["queued"]
    assert "running" in _ALLOWED_TRANSITIONS["queued"]
    assert "queued" in _ALLOWED_TRANSITIONS["failed"]
    assert not _ALLOWED_TRANSITIONS["succeeded"]


def test_idempotency_payload_mismatch_is_rejected() -> None:
    from hashscrap.models import CrawlJob

    job = CrawlJob(
        input_url="https://example.test/a",
        idempotency_key="same-key",
        max_attempts=3,
        priority=0,
        attempts=0,
        status="queued",
    )
    with pytest.raises(ValueError, match="different job payload"):
        _ensure_same_payload(job, "https://example.test/b", None, 3, 0)


def test_idempotency_payload_match_is_accepted() -> None:
    from hashscrap.models import CrawlJob

    job = CrawlJob(
        input_url="https://example.test/a",
        idempotency_key="same-key",
        max_attempts=3,
        priority=0,
        attempts=0,
        status="queued",
    )
    _ensure_same_payload(job, "https://example.test/a", None, 3, 0)
