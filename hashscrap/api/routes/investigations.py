"""Investigation endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import func, select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import InvestigationCreateIn, InvestigationOut, InvestigationsResponse
from hashscrap.api.serializers import investigation_out
from hashscrap.models import (
    CrawlJob,
    CrawlRun,
    Investigation,
    InvestigationItem,
    Observation,
)

router = APIRouter(prefix="/investigations", tags=["investigations"])


@router.post("", response_model=InvestigationOut, status_code=201)
def create_investigation(payload: InvestigationCreateIn) -> InvestigationOut:
    with session_scope() as session:
        investigation = Investigation(
            name=payload.nom,
            description=payload.description,
            status="en_cours",
        )
        session.add(investigation)
        session.commit()
        session.refresh(investigation)
        return investigation_out(investigation, 0, 0)


@router.get("", response_model=InvestigationsResponse)
def list_investigations() -> InvestigationsResponse:
    with session_scope() as session:
        investigations = session.scalars(
            select(Investigation).order_by(Investigation.updated_at.desc())
        ).all()
        items = []
        for investigation in investigations:
            members = session.scalars(
                select(InvestigationItem).where(
                    InvestigationItem.investigation_id == investigation.id
                )
            ).all()
            job_ids = {member.job_id for member in members if member.job_id is not None}
            sources = 0
            if job_ids:
                sources = int(
                    session.scalar(
                        select(func.count(func.distinct(CrawlJob.source_id))).where(
                            CrawlJob.id.in_(job_ids)
                        )
                    )
                    or 0
                )
            observations = (
                int(
                    session.scalar(
                        select(func.count(Observation.id))
                        .join(CrawlRun, Observation.run_id == CrawlRun.id)
                        .where(CrawlRun.job_id.in_(job_ids))
                    )
                    or 0
                )
                if job_ids
                else 0
            )
            items.append(investigation_out(investigation, sources, observations))
        return InvestigationsResponse(items=items, total=len(items))
