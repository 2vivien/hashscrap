"""Read-only HTTP contract over persisted evidence.

Scope: this API never writes. Source creation, crawl launch, retry and export
generation stay unavailable until their own contracts define permissions, audit and
error states. Routes are versioned under `/api/v1` and are derived from the persisted
models on purpose: a field exposed here is a field that exists and carries provenance.

Every response is bounded and paginated; nothing is invented when a value is missing.
"""

from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime
from typing import Annotated, Any, cast
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from pydantic import BaseModel, ConfigDict
from sqlalchemy import func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from hashscrap.db import create_database_engine
from hashscrap.models import CrawlJob, CrawlRun, Document, Entity, EntityObservation, Observation
from hashscrap.models import Source as SourceRow

API_PREFIX = "/api/v1"
MAX_LIMIT = 100


def _engine_from(request: Request) -> Engine:
    """Resolve the engine bound to the running application."""
    engine: Engine | None = getattr(request.app.state, "engine", None)
    if engine is None:
        raise RuntimeError("database engine is not configured")
    return engine


def _session(request: Request) -> Iterator[Session]:
    """Yield one session per request. The caller never commits here: the API is read-only."""
    with Session(_engine_from(request)) as session:
        yield session


SessionDependency = Annotated[Session, Depends(_session)]
LimitQuery = Annotated[int, Query(ge=1, le=MAX_LIMIT)]


class ApiModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class HealthResponse(ApiModel):
    status: str
    schema_version: str


class SummaryResponse(ApiModel):
    sources: int
    documents: int
    observations: int
    entities: int
    runs_total: int
    runs_succeeded: int
    runs_failed: int
    observations_pending_review: int
    last_run_at: datetime | None


class SourceResponse(ApiModel):
    id: UUID
    source_key: str
    base_url: str | None
    enabled: bool
    allowed_hosts: list[str]
    limits: dict[str, Any]


class RunResponse(ApiModel):
    id: UUID
    job_id: UUID
    source_key: str | None
    status: str
    started_at: datetime
    finished_at: datetime | None
    fetched_count: int
    failed_count: int
    bytes_received: int


class DocumentSummaryResponse(ApiModel):
    id: UUID
    original_url: str
    canonical_url: str | None
    status_code: int | None
    media_type: str | None
    content_sha256: str | None
    first_seen_at: datetime
    last_seen_at: datetime
    observations_count: int


class ObservationResponse(ApiModel):
    id: UUID
    field_name: str
    normalized_value: str
    observed_at: datetime
    evidence_ref: str
    extractor: str
    extractor_version: str
    validation_status: str


class DocumentDetailResponse(DocumentSummaryResponse):
    observations: list[ObservationResponse]


class EntityResponse(ApiModel):
    id: UUID
    entity_type: str
    normalized_identifier: str
    review_status: str
    observations_count: int


class DocumentListResponse(ApiModel):
    total: int
    items: list[DocumentSummaryResponse]


def _aware(value: datetime | None) -> datetime | None:
    """SQLite may return naive datetimes; the contract always exposes UTC."""
    if value is None:
        return None
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def _aware_required(value: datetime) -> datetime:
    converted = _aware(value)
    assert converted is not None  # noqa: S101 - value is not None by contract
    return converted


def create_api(engine: Engine | None = None) -> FastAPI:
    """Build the read-only API. Tests inject an engine; production resolves the env URL."""
    app = FastAPI(
        title="HashScrap API",
        version="1.0",
        description="Read-only access to collected evidence. No write route exists.",
    )
    app.state.engine = create_database_engine() if engine is None else engine

    @app.get(f"{API_PREFIX}/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(status="ok", schema_version="1.0")

    @app.get(f"{API_PREFIX}/summary", response_model=SummaryResponse)
    def summary(session: SessionDependency) -> SummaryResponse:
        def total(model: Any) -> int:
            return int(session.scalar(select(func.count()).select_from(model)) or 0)

        runs_total = total(CrawlRun)
        runs_succeeded = int(
            session.scalar(
                select(func.count()).select_from(CrawlRun).where(CrawlRun.status == "succeeded")
            )
            or 0
        )
        runs_failed = int(
            session.scalar(
                select(func.count()).select_from(CrawlRun).where(CrawlRun.status == "failed")
            )
            or 0
        )
        pending = int(
            session.scalar(
                select(func.count())
                .select_from(Observation)
                .where(Observation.validation_status == "unreviewed")
            )
            or 0
        )
        last_run = session.scalar(select(func.max(CrawlRun.started_at)))
        return SummaryResponse(
            sources=total(SourceRow),
            documents=total(Document),
            observations=total(Observation),
            entities=total(Entity),
            runs_total=runs_total,
            runs_succeeded=runs_succeeded,
            runs_failed=runs_failed,
            observations_pending_review=pending,
            last_run_at=_aware(last_run),
        )

    @app.get(f"{API_PREFIX}/sources", response_model=list[SourceResponse])
    def sources(session: SessionDependency) -> list[SourceResponse]:
        rows = session.scalars(select(SourceRow).order_by(SourceRow.source_key)).all()
        return [
            SourceResponse(
                id=row.id,
                source_key=row.source_key,
                base_url=row.base_url,
                enabled=row.enabled,
                allowed_hosts=list(row.policy_config.get("allowed_hosts", [])),
                limits=dict(row.policy_config.get("limits", {})),
            )
            for row in rows
        ]

    @app.get(f"{API_PREFIX}/runs", response_model=list[RunResponse])
    def runs(
        session: SessionDependency, limit: Annotated[int, Query(ge=1, le=MAX_LIMIT)] = 20
    ) -> list[RunResponse]:
        statement = (
            select(CrawlRun, SourceRow.source_key)
            .outerjoin(CrawlJob, CrawlJob.id == CrawlRun.job_id)
            .outerjoin(SourceRow, SourceRow.id == CrawlJob.source_id)
            .order_by(CrawlRun.started_at.desc())
            .limit(limit)
        )
        return [
            RunResponse(
                id=run.id,
                job_id=run.job_id,
                source_key=source_key,
                status=run.status,
                started_at=_aware_required(run.started_at),
                finished_at=_aware(run.finished_at),
                fetched_count=run.fetched_count,
                failed_count=run.failed_count,
                bytes_received=run.bytes_received,
            )
            for run, source_key in session.execute(statement).all()
        ]

    @app.get(f"{API_PREFIX}/documents", response_model=DocumentListResponse)
    def documents(
        session: SessionDependency,
        limit: Annotated[int, Query(ge=1, le=MAX_LIMIT)] = 20,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> DocumentListResponse:
        counts = (
            select(
                Document.id,
                func.count(Observation.id).label("observations_count"),
            )
            .outerjoin(Observation, Observation.document_id == Document.id)
            .group_by(Document.id)
            .subquery()
        )
        total = int(session.scalar(select(func.count()).select_from(Document)) or 0)
        rows = session.execute(
            select(Document, counts.c.observations_count)
            .join(counts, counts.c.id == Document.id)
            .order_by(Document.last_seen_at.desc(), Document.id)
            .limit(limit)
            .offset(offset)
        ).all()
        items: list[DocumentSummaryResponse] = []
        for row in rows:
            document = cast("Document", row[0])
            items.append(
                DocumentSummaryResponse(
                    id=document.id,
                    original_url=document.original_url,
                    canonical_url=document.canonical_url,
                    status_code=document.status_code,
                    media_type=document.media_type,
                    content_sha256=document.content_sha256,
                    first_seen_at=_aware_required(document.first_seen_at),
                    last_seen_at=_aware_required(document.last_seen_at),
                    observations_count=int(cast("int", row[1])),
                )
            )
        return DocumentListResponse(total=total, items=items)

    @app.get(f"{API_PREFIX}/documents/{{document_id}}", response_model=DocumentDetailResponse)
    def document_detail(document_id: UUID, session: SessionDependency) -> DocumentDetailResponse:
        document = session.get(Document, document_id)
        if document is None:
            raise HTTPException(status_code=404, detail="document not found")
        observations = session.scalars(
            select(Observation)
            .where(Observation.document_id == document_id)
            .order_by(Observation.field_name, Observation.evidence_ref, Observation.id)
        ).all()
        return DocumentDetailResponse(
            id=document.id,
            original_url=document.original_url,
            canonical_url=document.canonical_url,
            status_code=document.status_code,
            media_type=document.media_type,
            content_sha256=document.content_sha256,
            first_seen_at=_aware_required(document.first_seen_at),
            last_seen_at=_aware_required(document.last_seen_at),
            observations_count=len(observations),
            observations=[
                ObservationResponse(
                    id=observation.id,
                    field_name=observation.field_name,
                    normalized_value=observation.normalized_value,
                    observed_at=_aware_required(observation.observed_at),
                    evidence_ref=observation.evidence_ref,
                    extractor=observation.extractor,
                    extractor_version=observation.extractor_version,
                    validation_status=observation.validation_status,
                )
                for observation in observations
            ],
        )

    @app.get(f"{API_PREFIX}/entities", response_model=list[EntityResponse])
    def entities(
        session: SessionDependency, limit: Annotated[int, Query(ge=1, le=MAX_LIMIT)] = 20
    ) -> list[EntityResponse]:
        rows = session.execute(
            select(Entity, func.count(EntityObservation.id))
            .outerjoin(EntityObservation, EntityObservation.entity_id == Entity.id)
            .group_by(Entity.id)
            .order_by(Entity.entity_type, Entity.normalized_identifier)
            .limit(limit)
        ).all()
        return [
            EntityResponse(
                id=entity.id,
                entity_type=entity.entity_type,
                normalized_identifier=entity.normalized_identifier,
                review_status=entity.review_status,
                observations_count=int(observation_count),
            )
            for entity, observation_count in rows
        ]

    return app
