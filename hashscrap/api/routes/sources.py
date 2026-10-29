"""Source registry endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import SourceCreateIn, SourceOut, SourceStatus, SourcesResponse
from hashscrap.api.serializers import source_out
from hashscrap.models import CrawlJob, CrawlRun, Source

router = APIRouter(prefix="/sources", tags=["sources"])


def _source_status(session: Session, source: Source, last_run: CrawlRun | None) -> SourceStatus:
    """Derive the source state from its last run; never guess a validation."""
    if last_run is not None and last_run.status == "failed":
        return "erreur"
    if not source.enabled:
        return "en_attente"
    if last_run is None:
        return "en_attente"
    return "validee"


def _last_run(session: Session, source_id: object) -> CrawlRun | None:
    return session.scalar(
        select(CrawlRun)
        .join(CrawlJob, CrawlRun.job_id == CrawlJob.id)
        .where(CrawlJob.source_id == source_id)
        .order_by(CrawlRun.started_at.desc())
        .limit(1)
    )


@router.post("", response_model=SourceOut, status_code=201)
def create_source(payload: SourceCreateIn) -> SourceOut:
    with session_scope() as session:
        source = Source(
            source_key=payload.nom.lower().replace(" ", "-"),
            source_type=payload.type,
            base_url=payload.url,
            enabled=True,
            policy_config={"allowed_hosts": payload.domaines, "name": payload.nom},
        )
        session.add(source)
        session.commit()
        session.refresh(source)
        return source_out(source, "validee", None)


@router.get("", response_model=SourcesResponse)
def list_sources() -> SourcesResponse:
    with session_scope() as session:
        sources = session.scalars(select(Source).order_by(Source.source_key)).all()
        items: list[SourceOut] = []
        for source in sources:
            run = _last_run(session, source.id)
            items.append(
                source_out(
                    source,
                    _source_status(session, source, run),
                    run.started_at if run else None,
                )
            )
        return SourcesResponse(items=items, total=len(items))
