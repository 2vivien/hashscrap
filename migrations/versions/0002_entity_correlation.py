"""Add exact entity correlation tables.

Revision ID: 0002_entity_correlation
Revises: 0001_initial_schema
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0002_entity_correlation"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "entities",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("entity_type", sa.String(length=24), nullable=False),
        sa.Column("raw_identifier", sa.String(length=4096), nullable=False),
        sa.Column("normalized_identifier", sa.String(length=4096), nullable=False),
        sa.Column("normalization_method", sa.String(length=80), nullable=False),
        sa.Column("review_status", sa.String(length=24), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "entity_type IN ('organization', 'domain', 'ip', 'url')", name="ck_entities_type"
        ),
        sa.CheckConstraint(
            "review_status IN ('unreviewed', 'accepted_exact', 'needs_review', 'rejected')",
            name="ck_entities_review_status",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_entities_type_identifier", "entities", ["entity_type", "normalized_identifier"]
    )

    op.create_table(
        "entity_observations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("observation_id", sa.Uuid(), nullable=False),
        sa.Column("matching_method", sa.String(length=80), nullable=False),
        sa.Column("review_status", sa.String(length=24), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.ForeignKeyConstraint(["entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["observation_id"], ["observations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "entity_id", "observation_id", name="uq_entity_observations_entity_observation"
        ),
    )
    op.create_index("ix_entity_observations_observation", "entity_observations", ["observation_id"])

    op.create_table(
        "entity_relationships",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_entity_id", sa.Uuid(), nullable=False),
        sa.Column("target_entity_id", sa.Uuid(), nullable=False),
        sa.Column("relation_type", sa.String(length=120), nullable=False),
        sa.Column("evidence_observation_id", sa.Uuid(), nullable=False),
        sa.Column("review_status", sa.String(length=24), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint(
            "review_status IN ('unreviewed', 'accepted_exact', 'needs_review', 'rejected')",
            name="ck_entity_relationships_review_status",
        ),
        sa.ForeignKeyConstraint(["source_entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_entity_id"], ["entities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(
            ["evidence_observation_id"], ["observations.id"], ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_entity_relationships_source_type",
        "entity_relationships",
        ["source_entity_id", "relation_type"],
    )
    op.create_index("ix_entity_relationships_target", "entity_relationships", ["target_entity_id"])


def downgrade() -> None:
    op.drop_index("ix_entity_relationships_target", table_name="entity_relationships")
    op.drop_index("ix_entity_relationships_source_type", table_name="entity_relationships")
    op.drop_table("entity_relationships")
    op.drop_index("ix_entity_observations_observation", table_name="entity_observations")
    op.drop_table("entity_observations")
    op.drop_index("ix_entities_type_identifier", table_name="entities")
    op.drop_table("entities")
