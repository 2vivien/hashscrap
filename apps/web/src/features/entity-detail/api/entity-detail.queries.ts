import { useQuery } from "@tanstack/react-query";
import {
  MOCK_ENTITY,
  MOCK_ENTITY_OBSERVATIONS,
  MOCK_ENTITY_RELATIONS,
  MOCK_ENTITY_SOURCE_IDS,
} from "../mocks/entity-detail.mock";
import type { Entity, EntityObservation, EntityRelation } from "../types/entity-detail.types";

export const entityDetailKeys = {
  all: ["entity-detail"] as const,
  detail: (id: string) => [...entityDetailKeys.all, "detail", id] as const,
} as const;

export type EntityDetailKeys = typeof entityDetailKeys;

export interface EntityDetailPayload {
  entity: Entity;
  observations: EntityObservation[];
  relations: EntityRelation[];
  sourceIds: string[];
}

/**
 * Demo fetcher: the entity detail endpoint is not exposed by the engine yet.
 */
export async function fetchEntityDetail(id: string): Promise<EntityDetailPayload> {
  return {
    entity: { ...MOCK_ENTITY, id },
    observations: MOCK_ENTITY_OBSERVATIONS,
    relations: MOCK_ENTITY_RELATIONS,
    sourceIds: MOCK_ENTITY_SOURCE_IDS,
  };
}

export function useEntityDetail(id: string) {
  return useQuery({
    queryKey: entityDetailKeys.detail(id),
    queryFn: () => fetchEntityDetail(id),
    staleTime: 60_000,
  });
}
