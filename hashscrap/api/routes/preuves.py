"""Evidence endpoints built on the persisted documents."""

from __future__ import annotations

from fastapi import APIRouter
from sqlalchemy import select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import PreuvesResponse
from hashscrap.api.serializers import evidence_out
from hashscrap.models import Document, Source

router = APIRouter(prefix="/preuves", tags=["preuves"])


@router.get("", response_model=PreuvesResponse)
def list_preuves() -> PreuvesResponse:
    with session_scope() as session:
        documents = session.scalars(
            select(Document).order_by(Document.first_seen_at.desc()).limit(500)
        ).all()
        items = []
        for document in documents:
            source_name = "inconnu"
            if document.source_id is not None:
                source = session.get(Source, document.source_id)
                if source is not None:
                    source_name = source.source_key
            items.append(evidence_out(document, source_name))
        return PreuvesResponse(items=items, total=len(items))
