"""Read-only application layer that assembles an investigation report.

This module turns persisted rows into the versioned `InvestigationReport` contract and
does nothing else: it never writes, never commits, never reaches the network and never
produces text with a language model. Every observation and relationship it emits keeps the
provenance stored beside it; an element whose provenance is incomplete is dropped instead
of being completed with an invented value.
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import UTC, datetime
from typing import Literal, cast

from sqlalchemy import select
from sqlalchemy.orm import Session, aliased

from hashscrap.models import (
    CrawlJob,
    CrawlRun,
    Document,
    Entity,
    EntityRelationship,
    Observation,
)
from hashscrap.models import Source as SourceRow
from hashscrap.reports import (
    InvestigationReport,
    ReportError,
    ReportObservation,
    ReportRelationship,
    ReportSource,
)

SourceStatus = Literal["succeeded", "failed", "partial", "unavailable"]
ValidationStatus = Literal["unreviewed", "validated", "rejected"]
ReviewStatus = Literal["unreviewed", "accepted_exact", "needs_review", "rejected"]

# A source row can lose its identifier when the referenced source was deleted
# (`ON DELETE SET NULL`); provenance then stays explicit instead of being guessed.
UNRESOLVED_SOURCE = "unresolved"
MAX_ERROR_CODE_LENGTH = 80


def _aware(value: datetime) -> datetime:
    """SQLite returns naive datetimes; the report contract always exposes UTC."""
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def _source_status(statuses: Sequence[str]) -> SourceStatus:
    """Map persisted run statuses to the report vocabulary, without inventing coverage."""
    if not statuses:
        return "unavailable"
    unique = set(statuses)
    if unique == {"succeeded"}:
        return "succeeded"
    if unique <= {"failed", "cancelled"}:
        return "failed"
    return "partial"


def _last_error_code(codes: Sequence[str | None]) -> str | None:
    """Return the most recent bounded error code, never an internal message."""
    for code in reversed(codes):
        if code:
            return code[:MAX_ERROR_CODE_LENGTH]
    return None


def _entity_label(entity_type: str, normalized_identifier: str) -> str:
    """Label an entity unambiguously: the same identifier can exist in two namespaces."""
    return f"{entity_type}:{normalized_identifier}"


def build_report(
    session: Session,
    *,
    investigation_id: str,
    title: str,
    scope: str,
    source_key: str | None = None,
    max_observations: int = 1000,
    max_relationships: int = 1000,
) -> InvestigationReport:
    """Assemble one report from persisted evidence. The session is only ever read."""
    if max_observations < 1:
        raise ValueError("max_observations must be >= 1")
    if max_relationships < 1:
        raise ValueError("max_relationships must be >= 1")

    source_statement = select(SourceRow).order_by(SourceRow.source_key, SourceRow.id)
    if source_key is not None:
        source_statement = source_statement.where(SourceRow.source_key == source_key)
    source_rows = list(session.scalars(source_statement).all())
    selected_ids = [row.id for row in source_rows]

    sources: list[ReportSource] = []
    errors: list[ReportError] = []
    limitations: list[str] = []
    started_candidates: list[datetime] = []
    finished_candidates: list[datetime] = []

    for source in source_rows:
        run_rows = list(
            session.execute(
                select(CrawlRun, CrawlJob.error_code)
                .join(CrawlJob, CrawlJob.id == CrawlRun.job_id)
                .where(CrawlJob.source_id == source.id)
                .order_by(CrawlRun.started_at, CrawlRun.id)
            ).all()
        )
        runs = [run for run, _ in run_rows]
        status = _source_status([run.status for run in runs])
        fetched_count = sum(run.fetched_count for run in runs)
        failed_count = sum(run.failed_count for run in runs)
        error_code = _last_error_code([code for _, code in run_rows])
        started_candidates.extend(_aware(run.started_at) for run in runs)
        finished_candidates.extend(
            _aware(run.finished_at) for run in runs if run.finished_at is not None
        )

        sources.append(
            ReportSource(
                source_id=source.source_key,
                source_name=source.source_key,
                source_url=source.base_url,
                status=status,
                fetched_count=fetched_count,
                failed_count=failed_count,
                error_code=error_code,
            )
        )
        if status in {"failed", "partial"}:
            errors.append(
                ReportError(
                    source_id=source.source_key,
                    error_code=error_code or "collection_incomplete",
                    # Counts only: no exception text, no URL, nothing that could leak data.
                    message=(
                        f"{failed_count} échec(s) de récupération sur "
                        f"{fetched_count} page(s) collectée(s)"
                    ),
                )
            )
        if status == "unavailable":
            limitations.append(f"source {source.source_key} sans run de collecte enregistré")

    own_source = aliased(SourceRow)
    document_source = aliased(SourceRow)
    observation_statement = (
        select(
            Observation,
            Document.original_url,
            own_source.source_key,
            document_source.source_key,
        )
        .join(Document, Document.id == Observation.document_id)
        .outerjoin(own_source, own_source.id == Observation.source_id)
        .outerjoin(document_source, document_source.id == Document.source_id)
        .order_by(
            Observation.observed_at,
            Observation.field_name,
            Observation.evidence_ref,
            Observation.id,
        )
        .limit(max_observations)
    )
    if source_key is not None:
        observation_statement = observation_statement.where(Document.source_id.in_(selected_ids))

    observation_rows = list(session.execute(observation_statement).all())
    observations: list[ReportObservation] = []
    unreviewed = 0
    skipped_without_provenance = 0
    for observation, original_url, own_key, document_key in observation_rows:
        if not observation.evidence_ref or not original_url:
            skipped_without_provenance += 1
            continue
        if observation.validation_status == "unreviewed":
            unreviewed += 1
        observations.append(
            ReportObservation(
                observation_id=str(observation.id),
                field_name=observation.field_name,
                value=observation.normalized_value,
                source_id=own_key or document_key or UNRESOLVED_SOURCE,
                source_url=original_url,
                observed_at=_aware(observation.observed_at),
                evidence_ref=observation.evidence_ref,
                classification="direct_observation",
                validation_status=cast(ValidationStatus, observation.validation_status),
            )
        )

    source_entity = aliased(Entity)
    target_entity = aliased(Entity)
    evidence = aliased(Observation)
    evidence_document = aliased(Document)
    relationship_statement = (
        select(
            EntityRelationship,
            source_entity.entity_type,
            source_entity.normalized_identifier,
            target_entity.entity_type,
            target_entity.normalized_identifier,
            evidence.id,
            evidence.evidence_ref,
        )
        .join(source_entity, source_entity.id == EntityRelationship.source_entity_id)
        .join(target_entity, target_entity.id == EntityRelationship.target_entity_id)
        .join(evidence, evidence.id == EntityRelationship.evidence_observation_id)
        .join(evidence_document, evidence_document.id == evidence.document_id)
        .order_by(
            EntityRelationship.source_entity_id,
            EntityRelationship.relation_type,
            EntityRelationship.target_entity_id,
            EntityRelationship.id,
        )
        .limit(max_relationships)
    )
    if source_key is not None:
        relationship_statement = relationship_statement.where(
            evidence_document.source_id.in_(selected_ids)
        )

    relationship_rows = list(session.execute(relationship_statement).all())
    relationships: list[ReportRelationship] = []
    for (
        relationship,
        source_type,
        source_identifier,
        target_type,
        target_identifier,
        evidence_id,
        evidence_ref,
    ) in relationship_rows:
        if not evidence_ref:
            skipped_without_provenance += 1
            continue
        relationships.append(
            ReportRelationship(
                relationship_id=str(relationship.id),
                source_entity=_entity_label(source_type, source_identifier),
                relation_type=relationship.relation_type,
                target_entity=_entity_label(target_type, target_identifier),
                evidence_observation_id=str(evidence_id),
                evidence_ref=evidence_ref,
                review_status=cast(ReviewStatus, relationship.review_status),
            )
        )

    if unreviewed:
        limitations.append(f"{unreviewed} observation(s) au statut unreviewed")
    if len(observation_rows) >= max_observations:
        limitations.append(
            f"observations tronquées à la limite de {max_observations} ; "
            "d'autres observations peuvent exister"
        )
    if len(relationship_rows) >= max_relationships:
        limitations.append(
            f"relations tronquées à la limite de {max_relationships} ; "
            "d'autres relations peuvent exister"
        )
    if skipped_without_provenance:
        limitations.append(
            f"{skipped_without_provenance} élément(s) écarté(s) faute de provenance complète"
        )
    if source_key is not None:
        limitations.append(f"périmètre limité à la source {source_key}")

    started_at = min(started_candidates) if started_candidates else datetime.now(UTC)
    finished_at = max(finished_candidates) if finished_candidates else None

    return InvestigationReport(
        investigation_id=investigation_id,
        title=title,
        scope=scope,
        started_at=started_at,
        finished_at=finished_at,
        sources=sources,
        observations=observations,
        relationships=relationships,
        errors=errors,
        limitations=limitations,
    )
