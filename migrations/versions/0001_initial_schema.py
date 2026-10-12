"""Initial HashScrap persistence schema.

Revision ID: 0001_initial_schema
Revises:
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "sources",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_key", sa.String(length=120), nullable=False),
        sa.Column("source_type", sa.String(length=40), nullable=False),
        sa.Column("base_url", sa.String(length=4096), nullable=True),
        sa.Column("policy_config", sa.JSON(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("length(source_key) > 0", name="ck_sources_source_key_nonempty"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_key"),
    )
    op.create_index("ix_sources_enabled", "sources", ["enabled"])

    op.create_table(
        "crawl_jobs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=True),
        sa.Column("input_url", sa.String(length=4096), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("max_attempts", sa.Integer(), nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("error_code", sa.String(length=80), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled')", name="ck_crawl_jobs_status"),
        sa.CheckConstraint("attempts >= 0 AND max_attempts > 0 AND attempts <= max_attempts", name="ck_crawl_jobs_attempts"),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("idempotency_key"),
    )
    op.create_index("ix_crawl_jobs_status_created", "crawl_jobs", ["status", "created_at"])

    op.create_table(
        "crawl_runs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("job_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fetched_count", sa.Integer(), nullable=False),
        sa.Column("failed_count", sa.Integer(), nullable=False),
        sa.Column("bytes_received", sa.BigInteger(), nullable=False),
        sa.Column("config_snapshot", sa.JSON(), nullable=False),
        sa.CheckConstraint("status IN ('running', 'succeeded', 'failed', 'cancelled')", name="ck_crawl_runs_status"),
        sa.CheckConstraint("fetched_count >= 0 AND failed_count >= 0 AND bytes_received >= 0", name="ck_crawl_runs_nonnegative_counts"),
        sa.ForeignKeyConstraint(["job_id"], ["crawl_jobs.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_crawl_runs_job_started", "crawl_runs", ["job_id", "started_at"])

    op.create_table(
        "documents",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=True),
        sa.Column("run_id", sa.Uuid(), nullable=True),
        sa.Column("original_url", sa.String(length=4096), nullable=False),
        sa.Column("canonical_url", sa.String(length=4096), nullable=True),
        sa.Column("content_sha256", sa.String(length=64), nullable=True),
        sa.Column("media_type", sa.String(length=255), nullable=True),
        sa.Column("status_code", sa.Integer(), nullable=True),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("retention_deadline", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status_code IS NULL OR (status_code >= 100 AND status_code <= 599)", name="ck_documents_status_code"),
        sa.CheckConstraint("content_sha256 IS NULL OR length(content_sha256) = 64", name="ck_documents_sha256_length"),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["run_id"], ["crawl_runs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_documents_canonical_url", "documents", ["canonical_url"])
    op.create_index("ix_documents_content_sha256", "documents", ["content_sha256"])
    op.create_index("ix_documents_source_last_seen", "documents", ["source_id", "last_seen_at"])

    op.create_table(
        "observations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("document_id", sa.Uuid(), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=True),
        sa.Column("run_id", sa.Uuid(), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("field_name", sa.String(length=120), nullable=False),
        sa.Column("raw_value", sa.Text(), nullable=False),
        sa.Column("normalized_value", sa.Text(), nullable=False),
        sa.Column("extractor", sa.String(length=120), nullable=False),
        sa.Column("extractor_version", sa.String(length=40), nullable=False),
        sa.Column("evidence_ref", sa.String(length=500), nullable=False),
        sa.Column("validation_status", sa.String(length=16), nullable=False),
        sa.CheckConstraint("validation_status IN ('unreviewed', 'validated', 'rejected')", name="ck_observations_validation_status"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["run_id"], ["crawl_runs.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_observations_document_observed", "observations", ["document_id", "observed_at"])
    op.create_index("ix_observations_source_field", "observations", ["source_id", "field_name"])


def downgrade() -> None:
    op.drop_index("ix_observations_source_field", table_name="observations")
    op.drop_index("ix_observations_document_observed", table_name="observations")
    op.drop_table("observations")
    op.drop_index("ix_documents_source_last_seen", table_name="documents")
    op.drop_index("ix_documents_content_sha256", table_name="documents")
    op.drop_index("ix_documents_canonical_url", table_name="documents")
    op.drop_table("documents")
    op.drop_index("ix_crawl_runs_job_started", table_name="crawl_runs")
    op.drop_table("crawl_runs")
    op.drop_index("ix_crawl_jobs_status_created", table_name="crawl_jobs")
    op.drop_table("crawl_jobs")
    op.drop_index("ix_sources_enabled", table_name="sources")
    op.drop_table("sources")
