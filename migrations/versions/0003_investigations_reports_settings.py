"""Add investigations, reports, engine settings, audit events and read-model columns.

Revision ID: 0003_investigations_settings
Revises: 0002_entity_correlation
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0003_investigations_settings"
down_revision = "0002_entity_correlation"
branch_labels = None
depends_on = None

ENTITY_TYPES = "('organization', 'domain', 'ip', 'url', 'email', 'personne', 'telephone', 'hash')"


def upgrade() -> None:
    op.create_table(
        "investigations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="en_cours"),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "status IN ('en_cours', 'terminee', 'en_attente', 'annulee')",
            name="ck_investigations_status",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_investigations_status_updated", "investigations", ["status", "updated_at"])

    op.create_table(
        "investigation_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("investigation_id", sa.Uuid(), nullable=False),
        sa.Column("job_id", sa.Uuid(), nullable=True),
        sa.Column("document_id", sa.Uuid(), nullable=True),
        sa.Column("entity_id", sa.Uuid(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["investigation_id"], ["investigations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["job_id"], ["crawl_jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "investigation_id",
            "job_id",
            "document_id",
            "entity_id",
            name="uq_investigation_items_member",
        ),
    )
    op.create_index(
        "ix_investigation_items_investigation", "investigation_items", ["investigation_id"]
    )

    op.create_table(
        "reports",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("investigation_id", sa.Uuid(), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False, server_default="en_attente"),
        sa.Column("format", sa.String(length=16), nullable=False, server_default="markdown"),
        sa.Column("content", sa.Text(), nullable=False, server_default=""),
        sa.Column(
            "generated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "status IN ('en_attente', 'validee', 'rejetee')", name="ck_reports_status"
        ),
        sa.CheckConstraint("format IN ('pdf', 'markdown', 'json')", name="ck_reports_format"),
        sa.ForeignKeyConstraint(["investigation_id"], ["investigations.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reports_investigation", "reports", ["investigation_id"])

    op.create_table(
        "engine_settings",
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("key"),
    )

    op.create_table(
        "audit_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("actor", sa.String(length=120), nullable=False, server_default="local"),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("resource", sa.String(length=200), nullable=False),
        sa.Column(
            "occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("metadata", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_audit_events_occurred", "audit_events", ["occurred_at"])

    op.add_column("crawl_jobs", sa.Column("reference", sa.String(length=32), nullable=True))
    op.add_column("crawl_jobs", sa.Column("target_pages", sa.Integer(), nullable=True))
    op.add_column("documents", sa.Column("content_bytes", sa.Integer(), nullable=True))
    op.create_index("ix_crawl_jobs_reference", "crawl_jobs", ["reference"], unique=True)

    op.drop_constraint("ck_entities_type", "entities", type_="check")
    op.create_check_constraint("ck_entities_type", "entities", f"entity_type IN {ENTITY_TYPES}")


def downgrade() -> None:
    op.drop_constraint("ck_entities_type", "entities", type_="check")
    op.create_check_constraint(
        "ck_entities_type", "entities", "entity_type IN ('organization', 'domain', 'ip', 'url')"
    )
    op.drop_index("ix_crawl_jobs_reference", table_name="crawl_jobs")
    op.drop_column("crawl_jobs", "target_pages")
    op.drop_column("crawl_jobs", "reference")
    op.drop_column("documents", "content_bytes")
    op.drop_index("ix_audit_events_occurred", table_name="audit_events")
    op.drop_table("audit_events")
    op.drop_table("engine_settings")
    op.drop_index("ix_reports_investigation", table_name="reports")
    op.drop_table("reports")
    op.drop_index("ix_investigation_items_investigation", table_name="investigation_items")
    op.drop_table("investigation_items")
    op.drop_index("ix_investigations_status_updated", table_name="investigations")
    op.drop_table("investigations")
