"""SQLAlchemy 2.x models for the initial HashScrap persistence schema."""
from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all persisted models."""


class Source(Base):
    __tablename__ = "sources"
    __table_args__ = (
        CheckConstraint("length(source_key) > 0", name="ck_sources_source_key_nonempty"),
        Index("ix_sources_enabled", "enabled"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    source_key: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    source_type: Mapped[str] = mapped_column(String(40), nullable=False, default="http")
    base_url: Mapped[str | None] = mapped_column(String(4096))
    policy_config: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    jobs: Mapped[list[CrawlJob]] = relationship(back_populates="source")
    documents: Mapped[list[Document]] = relationship(back_populates="source")


class CrawlJob(Base):
    __tablename__ = "crawl_jobs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')",
            name="ck_crawl_jobs_status",
        ),
        CheckConstraint("attempts >= 0 AND max_attempts > 0 AND attempts <= max_attempts",
                        name="ck_crawl_jobs_attempts"),
        Index("ix_crawl_jobs_status_created", "status", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    source_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sources.id", ondelete="SET NULL")
    )
    input_url: Mapped[str] = mapped_column(String(4096), nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="queued")
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=3)
    idempotency_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_code: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    source: Mapped[Source | None] = relationship(back_populates="jobs")
    runs: Mapped[list[CrawlRun]] = relationship(back_populates="job")


class CrawlRun(Base):
    __tablename__ = "crawl_runs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('running', 'succeeded', 'failed', 'cancelled')",
            name="ck_crawl_runs_status",
        ),
        CheckConstraint("fetched_count >= 0 AND failed_count >= 0 AND bytes_received >= 0",
                        name="ck_crawl_runs_nonnegative_counts"),
        Index("ix_crawl_runs_job_started", "job_id", "started_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    job_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("crawl_jobs.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="running")
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    fetched_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    bytes_received: Mapped[int] = mapped_column(BigInteger, nullable=False, default=0)
    config_snapshot: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)

    job: Mapped[CrawlJob] = relationship(back_populates="runs")
    documents: Mapped[list[Document]] = relationship(back_populates="run")


class Document(Base):
    __tablename__ = "documents"
    __table_args__ = (
        CheckConstraint("status_code IS NULL OR (status_code >= 100 AND status_code <= 599)",
                        name="ck_documents_status_code"),
        CheckConstraint("content_sha256 IS NULL OR length(content_sha256) = 64",
                        name="ck_documents_sha256_length"),
        Index("ix_documents_canonical_url", "canonical_url"),
        Index("ix_documents_content_sha256", "content_sha256"),
        Index("ix_documents_source_last_seen", "source_id", "last_seen_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    source_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sources.id", ondelete="SET NULL")
    )
    run_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("crawl_runs.id", ondelete="SET NULL")
    )
    original_url: Mapped[str] = mapped_column(String(4096), nullable=False)
    canonical_url: Mapped[str | None] = mapped_column(String(4096))
    content_sha256: Mapped[str | None] = mapped_column(String(64))
    media_type: Mapped[str | None] = mapped_column(String(255))
    status_code: Mapped[int | None] = mapped_column(Integer)
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    retention_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    source: Mapped[Source | None] = relationship(back_populates="documents")
    run: Mapped[CrawlRun | None] = relationship(back_populates="documents")
    observations: Mapped[list[Observation]] = relationship(back_populates="document")


class Observation(Base):
    __tablename__ = "observations"
    __table_args__ = (
        CheckConstraint(
            "validation_status IN ('unreviewed', 'validated', 'rejected')",
            name="ck_observations_validation_status",
        ),
        Index("ix_observations_document_observed", "document_id", "observed_at"),
        Index("ix_observations_source_field", "source_id", "field_name"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    document_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    source_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sources.id", ondelete="SET NULL")
    )
    run_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("crawl_runs.id", ondelete="SET NULL")
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    field_name: Mapped[str] = mapped_column(String(120), nullable=False)
    raw_value: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_value: Mapped[str] = mapped_column(Text, nullable=False)
    extractor: Mapped[str] = mapped_column(String(120), nullable=False)
    extractor_version: Mapped[str] = mapped_column(String(40), nullable=False)
    evidence_ref: Mapped[str] = mapped_column(String(500), nullable=False)
    validation_status: Mapped[str] = mapped_column(
        String(16), nullable=False, default="unreviewed"
    )

    document: Mapped[Document] = relationship(back_populates="observations")
