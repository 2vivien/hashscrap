"""Report endpoints."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import RapportsResponse
from hashscrap.api.serializers import report_out
from hashscrap.models import Investigation, Report

router = APIRouter(prefix="/rapports", tags=["rapports"])


@router.get("", response_model=RapportsResponse)
def list_rapports() -> RapportsResponse:
    with session_scope() as session:
        reports = session.scalars(select(Report).order_by(Report.generated_at.desc())).all()
        items = []
        for report in reports:
            name = "investigation"
            if report.investigation_id is not None:
                investigation = session.get(Investigation, report.investigation_id)
                if investigation is not None:
                    name = investigation.name
            items.append(report_out(report, name))
        return RapportsResponse(items=items, total=len(items))
