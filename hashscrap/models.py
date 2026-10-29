"""SQLAlchemy 2.x models for the initial HashScrap persistence schema."""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
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
        CheckConstraint(
            "attempts >= 0 AND max_attempts > 0 AND attempts <= max_attempts",
            name="ck_crawl_jobs_attempts",
        ),
        Index("ix_crawl_jobs_status_created", "status", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    source_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("sources.id", ondelete="SET NULL")
    )
    input_url: Mapped[str] = mapped_column(String(4096), nullable=False)
    reference: Mapped[str | None] = mapped_column(String(32), unique=True)
    target_pages: Mapped[int | None] = mapped_column(Integer)
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
        CheckConstraint(
            "fetched_count >= 0 AND failed_count >= 0 AND bytes_received >= 0",
            name="ck_crawl_runs_nonnegative_counts",
        ),
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
        CheckConstraint(
            "status_code IS NULL OR (status_code >= 100 AND status_code <= 599)",
            name="ck_documents_status_code",
        ),
        CheckConstraint(
            "content_sha256 IS NULL OR length(content_sha256) = 64",
            name="ck_documents_sha256_length",
        ),
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
    content_bytes: Mapped[int | None] = mapped_column(Integer)
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
    validation_status: Mapped[str] = mapped_column(String(16), nullable=False, default="unreviewed")

    document: Mapped[Document] = relationship(back_populates="observations")


class Entity(Base):
    __tablename__ = "entities"
    __table_args__ = (
        CheckConstraint(
            "entity_type IN ('organization', 'domain', 'ip', 'url')",
            name="ck_entities_type",
        ),
        CheckConstraint(
            "review_status IN ('unreviewed', 'accepted_exact', 'needs_review', 'rejected')",
            name="ck_entities_review_status",
        ),
        Index("ix_entities_type_identifier", "entity_type", "normalized_identifier"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    entity_type: Mapped[str] = mapped_column(String(24), nullable=False)
    raw_identifier: Mapped[str] = mapped_column(String(4096), nullable=False)
    normalized_identifier: Mapped[str] = mapped_column(String(4096), nullable=False)
    normalization_method: Mapped[str] = mapped_column(String(80), nullable=False)
    review_status: Mapped[str] = mapped_column(String(24), nullable=False, default="unreviewed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    observations: Mapped[list[EntityObservation]] = relationship(back_populates="entity")
    outgoing_relationships: Mapped[list[EntityRelationship]] = relationship(
        back_populates="source_entity", foreign_keys="EntityRelationship.source_entity_id"
    )
    incoming_relationships: Mapped[list[EntityRelationship]] = relationship(
        back_populates="target_entity", foreign_keys="EntityRelationship.target_entity_id"
    )


class EntityObservation(Base):
    __tablename__ = "entity_observations"
    __table_args__ = (
        UniqueConstraint(
            "entity_id", "observation_id", name="uq_entity_observations_entity_observation"
        ),
        Index("ix_entity_observations_observation", "observation_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    entity_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    observation_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("observations.id", ondelete="CASCADE"), nullable=False
    )
    matching_method: Mapped[str] = mapped_column(String(80), nullable=False)
    review_status: Mapped[str] = mapped_column(String(24), nullable=False, default="unreviewed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    entity: Mapped[Entity] = relationship(back_populates="observations")
    observation: Mapped[Observation] = relationship()


class EntityRelationship(Base):
    __tablename__ = "entity_relationships"
    __table_args__ = (
        CheckConstraint(
            "review_status IN ('unreviewed', 'accepted_exact', 'needs_review', 'rejected')",
            name="ck_entity_relationships_review_status",
        ),
        Index("ix_entity_relationships_source_type", "source_entity_id", "relation_type"),
        Index("ix_entity_relationships_target", "target_entity_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    source_entity_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    target_entity_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    relation_type: Mapped[str] = mapped_column(String(120), nullable=False)
    evidence_observation_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("observations.id", ondelete="RESTRICT"), nullable=False
    )
    review_status: Mapped[str] = mapped_column(String(24), nullable=False, default="unreviewed")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    source_entity: Mapped[Entity] = relationship(
        back_populates="outgoing_relationships", foreign_keys=[source_entity_id]
    )
    target_entity: Mapped[Entity] = relationship(
        back_populates="incoming_relationships", foreign_keys=[target_entity_id]
    )
    evidence_observation: Mapped[Observation] = relationship()


class Investigation(Base):
    __tablename__ = "investigations"
    __table_args__ = (
        CheckConstraint(
            "status IN ('en_cours', 'terminee', 'en_attente', 'annulee')",
            name="ck_investigations_status",
        ),
        Index("ix_investigations_status_updated", "status", "updated_at"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="en_cours")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list[InvestigationItem]] = relationship(
        back_populates="investigation", cascade="all, delete-orphan"
    )
    reports: Mapped[list[Report]] = relationship(back_populates="investigation")


class InvestigationItem(Base):
    __tablename__ = "investigation_items"
    __table_args__ = (
        UniqueConstraint(
            "investigation_id",
            "job_id",
            "document_id",
            "entity_id",
            name="uq_investigation_items_member",
        ),
        Index("ix_investigation_items_investigation", "investigation_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    investigation_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False
    )
    job_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("crawl_jobs.id", ondelete="CASCADE")
    )
    document_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE")
    )
    entity_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("entities.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    investigation: Mapped[Investigation] = relationship(back_populates="items")


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        CheckConstraint("status IN ('en_attente', 'validee', 'rejetee')", name="ck_reports_status"),
        CheckConstraint("format IN ('pdf', 'markdown', 'json')", name="ck_reports_format"),
        Index("ix_reports_investigation", "investigation_id"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    investigation_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("investigations.id", ondelete="SET NULL")
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="en_attente")
    format: Mapped[str] = mapped_column(String(16), nullable=False, default="markdown")
    content: Mapped[str] = mapped_column(Text, nullable=False, default="")
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    investigation: Mapped[Investigation | None] = relationship(back_populates="reports")


class EngineSetting(Base):
    __tablename__ = "engine_settings"

    key: Mapped[str] = mapped_column(String(80), primary_key=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )


class AuditEvent(Base):
    __tablename__ = "audit_events"
    __table_args__ = (Index("ix_audit_events_occurred", "occurred_at"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    actor: Mapped[str] = mapped_column(String(120), nullable=False, default="local")
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    resource: Mapped[str] = mapped_column(String(200), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    details: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, nullable=False, default=dict)
