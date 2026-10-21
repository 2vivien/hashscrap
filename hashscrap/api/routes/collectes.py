"""Collection job endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import (
    CollecteDetailOut,
    CollecteErrorOut,
    CollecteEventOut,
    CollectesResponse,
)
from hashscrap.api.serializers import collecte_detail_out, collecte_out, job_reference
from hashscrap.models import CrawlJob, CrawlRun, Observation, Source

router = APIRouter(prefix="/collectes", tags=["collectes"])

MAX_EVENTS = 200


@router.get("", response_model=CollectesResponse)
def list_collectes() -> CollectesResponse:
    with session_scope() as session:
        jobs = session.scalars(select(CrawlJob).order_by(CrawlJob.created_at.desc())).all()
        items = []
        for job in jobs:
            run = session.scalar(
                select(CrawlRun)
                .where(CrawlRun.job_id == job.id)
                .order_by(CrawlRun.started_at.desc())
                .limit(1)
            )
            source = session.get(Source, job.source_id) if job.source_id else None
            items.append(collecte_out(job, run, source))
        return CollectesResponse(items=items, total=len(items))


@router.get("/{job_id}", response_model=CollecteDetailOut)
def get_collecte(job_id: str) -> CollecteDetailOut:
    with session_scope() as session:
        job = session.scalar(select(CrawlJob).where(CrawlJob.reference == job_id))
        if job is None:
            try:
                job = session.get(CrawlJob, UUID(job_id))
            except ValueError as exc:
                raise HTTPException(status_code=404, detail="collecte introuvable") from exc
        if job is None:
            raise HTTPException(status_code=404, detail="collecte introuvable")

        run = session.scalar(
            select(CrawlRun)
            .where(CrawlRun.job_id == job.id)
            .order_by(CrawlRun.started_at.desc())
            .limit(1)
        )
        source = session.get(Source, job.source_id) if job.source_id else None
        observations: list[Observation] = []
        if run is not None:
            observations = list(
                session.scalars(select(Observation).where(Observation.run_id == run.id))
            )
        erreurs = [
            CollecteErrorOut(
                code=job.error_code or "job_failed",
                message="La collecte s'est terminée en erreur",
                type="Erreur",
                count=1,
            )
        ]
        evenements: list[CollecteEventOut] = []
        if run is not None and run.started_at is not None:
            evenements.append(
                CollecteEventOut(
                    at=run.started_at,
                    label="Collecte démarrée",
                    detail=job_reference(job),
                )
            )
        return collecte_detail_out(job, run, source, observations, erreurs, evenements)
