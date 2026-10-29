import { apiRequest } from "../../../lib/api-client";
import { EntityDetailResponseSchema, type EntityDetailResponse } from "../validators/entity-detail.schema";

export const entityDetailKeys = {
  all: ["entity-detail"] as const,
  detail: (id: string) => [...entityDetailKeys.all, "detail", id] as const,
};
export type EntityDetailKeys = typeof entityDetailKeys;

/** GET /api/v1/entites/{entity_id} */
export async function fetchEntityDetail(id: string, signal?: AbortSignal): Promise<EntityDetailResponse> {
  return apiRequest(`/entites/${encodeURIComponent(id)}`, EntityDetailResponseSchema, { signal });
}
