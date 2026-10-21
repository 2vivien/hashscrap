"""Dashboard aggregation endpoint."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import func, select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import (
    ActivityOut,
    CollecteOut,
    DashboardOut,
    DashboardStatsOut,
)
from hashscrap.api.serializers import activity_out, collecte_out, stat_out
from hashscrap.models import (
    CrawlJob,
    CrawlRun,
    Document,
    Entity,
    Observation,
    Source,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

RECENT_LIMIT = 6


@router.get("", response_model=DashboardOut)
def get_dashboard() -> DashboardOut:
    with session_scope() as session:
        sources = int(session.scalar(select(func.count(Source.id))) or 0)
        collectes_total = int(session.scalar(select(func.count(CrawlJob.id))) or 0)
        observations = int(session.scalar(select(func.count(Observation.id))) or 0)
        entites = int(session.scalar(select(func.count(Entity.id))) or 0)

        recent_jobs = session.scalars(
            select(CrawlJob).order_by(CrawlJob.created_at.desc()).limit(RECENT_LIMIT)
        ).all()
        recent: list[CollecteOut] = []
        for job in recent_jobs:
            run = session.scalar(
                select(CrawlRun)
                .where(CrawlRun.job_id == job.id)
                .order_by(CrawlRun.started_at.desc())
                .limit(1)
            )
            source = session.get(Source, job.source_id) if job.source_id else None
            recent.append(collecte_out(job, run, source))

        activity: list[ActivityOut] = []
        for job in recent_jobs:
            run = session.scalar(
                select(CrawlRun)
                .where(CrawlRun.job_id == job.id)
                .order_by(CrawlRun.started_at.desc())
                .limit(1)
            )
            if run is None or run.started_at is None:
                continue
            source = session.get(Source, job.source_id) if job.source_id else None
            activity.append(
                activity_out(
                    str(run.id),
                    run.started_at,
                    "erreur" if run.status == "failed" else "collecte",
                    "Collecte démarrée" if run.status != "failed" else "Erreur réseau",
                    f"{job.reference or job.id} • {source.source_key if source else ''}",
                )
            )

        failed_sources = int(
            session.scalar(
                select(func.count(func.distinct(CrawlJob.source_id))).where(
                    CrawlJob.status == "failed"
                )
            )
            or 0
        )
        pending_evidence = int(
            session.scalar(select(func.count(Document.id)).where(Document.content_sha256.is_(None)))
            or 0
        )
        points = [
            f"{failed_sources} sources en erreur nécessitent validation",
            f"{pending_evidence} preuves non vérifiées",
        ]

        return DashboardOut(
            stats=DashboardStatsOut(
                sources=stat_out(sources),
                collectes=stat_out(collectes_total),
                observations=stat_out(observations),
                entites=stat_out(entites),
            ),
            collectes=recent,
            activite=activity,
            points_attention=points,
        )
