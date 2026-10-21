"""Timeline endpoints built from the persisted collection history."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import ChronologieResponse, TimelineEventOut
from hashscrap.api.serializers import timeline_event_out
from hashscrap.models import (
    CrawlJob,
    CrawlRun,
    Document,
    Entity,
    EntityRelationship,
    Observation,
)

router = APIRouter(prefix="/chronologie", tags=["chronologie"])

MAX_EVENTS = 200


@router.get("", response_model=ChronologieResponse)
def get_chronologie() -> ChronologieResponse:
    with session_scope() as session:
        events: list[TimelineEventOut] = []

        runs = session.execute(
            select(CrawlRun, CrawlJob).join(CrawlJob, CrawlRun.job_id == CrawlJob.id)
        ).all()
        for run, job in runs:
            moment = run.finished_at or run.started_at
            if moment is None:
                continue
            label = "Collecte terminée" if run.status == "succeeded" else "Collecte démarrée"
            events.append(
                timeline_event_out(
                    str(run.id),
                    moment,
                    "collecte",
                    label,
                    f"{job.reference or job.id} • {run.fetched_count} pages",
                )
            )

        observations = session.scalars(
            select(Observation).order_by(Observation.observed_at.desc()).limit(100)
        ).all()
        for observation in observations:
            events.append(
                timeline_event_out(
                    str(observation.id),
                    observation.observed_at,
                    "observation",
                    f"Nouvelle observation {observation.field_name}",
                    observation.normalized_value[:120],
                )
            )

        relations = session.scalars(
            select(EntityRelationship).order_by(EntityRelationship.created_at.desc()).limit(50)
        ).all()
        for relation in relations:
            target = session.get(Entity, relation.target_entity_id)
            events.append(
                timeline_event_out(
                    str(relation.id),
                    relation.created_at,
                    "relation",
                    "Relation détectée",
                    f"{relation.relation_type} → {target.raw_identifier if target else ''}",
                )
            )

        documents = session.scalars(
            select(Document).order_by(Document.first_seen_at.desc()).limit(100)
        ).all()
        for document in documents:
            events.append(
                timeline_event_out(
                    str(document.id),
                    document.first_seen_at,
                    "preuve",
                    "Preuve archivée",
                    f"SHA-256: {(document.content_sha256 or '')[:6]}…",
                )
            )

        events.sort(key=lambda event: event.date, reverse=True)
        return ChronologieResponse(items=events[:MAX_EVENTS], total=len(events))
