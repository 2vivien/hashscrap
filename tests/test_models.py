from __future__ import annotations

import pytest
from sqlalchemy import CheckConstraint, UniqueConstraint

from hashscrap.db import database_url
from hashscrap.models import Base, CrawlJob, Document, Observation, Source


def test_initial_schema_contains_only_mvp_tables() -> None:
    assert set(Base.metadata.tables) == {
        "sources", "crawl_jobs", "crawl_runs", "documents", "observations",
        "entities", "entity_observations", "entity_relationships"
    }


def test_required_uniqueness_and_integrity_constraints_exist() -> None:
    source_constraints = {type(item) for item in Source.__table__.constraints}
    job_unique_constraints = [
        item for item in CrawlJob.__table__.constraints if isinstance(item, UniqueConstraint)
    ]
    assert CheckConstraint in source_constraints
    assert any(item.columns.keys() == ["source_key"] for item in Source.__table__.constraints
               if isinstance(item, UniqueConstraint))
    assert any(item.columns.keys() == ["idempotency_key"] for item in job_unique_constraints)
    assert any(item.name == "ck_documents_sha256_length" for item in Document.__table__.constraints)
    assert any(item.name == "ck_observations_validation_status" for item in Observation.__table__.constraints)


def test_database_url_is_required(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("HASHSCRAP_DATABASE_URL", raising=False)
    with pytest.raises(RuntimeError, match="HASHSCRAP_DATABASE_URL is required"):
        database_url()


def test_database_url_rejects_non_postgres(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("HASHSCRAP_DATABASE_URL", "sqlite:///local.db")
    with pytest.raises(RuntimeError, match="must target PostgreSQL"):
        database_url()
