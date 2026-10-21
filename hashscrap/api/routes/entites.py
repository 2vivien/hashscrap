"""Entity correlation endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select

from hashscrap.api.deps import session_scope
from hashscrap.api.schemas import (
    EntitiesResponse,
    EntityDetailOut,
    EntityRelationOut,
)
from hashscrap.api.serializers import (
    entity_detail_out,
    entity_observation_out,
    entity_out,
    entity_relation_out,
)
from hashscrap.models import (
    Entity,
    EntityObservation,
    EntityRelationship,
    Observation,
)

router = APIRouter(prefix="/entites", tags=["entites"])


@router.get("", response_model=EntitiesResponse)
def list_entites() -> EntitiesResponse:
    with session_scope() as session:
        counts = dict(
            session.execute(
                select(EntityObservation.entity_id, func.count()).group_by(
                    EntityObservation.entity_id
                )
            ).all()
        )
        entities = session.scalars(select(Entity).order_by(Entity.created_at.desc())).all()
        items = [entity_out(entity, int(counts.get(entity.id, 0))) for entity in entities]
        return EntitiesResponse(items=items, total=len(items))


@router.get("/{entity_id}", response_model=EntityDetailOut)
def get_entite(entity_id: str) -> EntityDetailOut:
    with session_scope() as session:
        entity = None
        try:
            entity = session.get(Entity, UUID(entity_id))
        except ValueError:
            entity = None
        if entity is None:
            raise HTTPException(status_code=404, detail="entité introuvable")

        observation_rows = session.execute(
            select(Observation, EntityObservation)
            .join(EntityObservation, EntityObservation.observation_id == Observation.id)
            .where(EntityObservation.entity_id == entity.id)
        ).all()
        observations = [entity_observation_out(observation) for observation, _ in observation_rows]

        relations: list[EntityRelationOut] = []
        outgoing = session.scalars(
            select(EntityRelationship).where(EntityRelationship.source_entity_id == entity.id)
        ).all()
        for relation in outgoing:
            target = session.get(Entity, relation.target_entity_id)
            if target is None:
                continue
            relations.append(entity_relation_out(relation, target, relation.relation_type))

        sources: list[str] = []
        return entity_detail_out(entity, observations, relations, sources)
