import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_ENTITY_DETAIL } from "../mocks/entity-detail.mock";
import {
  EntityDetailResponseSchema,
  type EntityDetailResponse,
} from "../validators/entity-detail.schema";

/** Query keys for the entity-detail feature. */
export const entityDetailKeys = {
  all: ["entity-detail"] as const,
  detail: (id: string) => [...entityDetailKeys.all, "detail", id] as const,
};

export type EntityDetailKeys = typeof entityDetailKeys;

/** Read the entity detail exposed by the engine. */
export async function fetchEntityDetail(id: string, signal?: AbortSignal): Promise<EntityDetailResponse> {
  if (isMockSource()) {
    return MOCK_ENTITY_DETAIL;
  }
  return apiRequest(`/entites/${id}`, EntityDetailResponseSchema, { signal });
}