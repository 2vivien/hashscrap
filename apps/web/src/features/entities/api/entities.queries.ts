import { apiRequest } from "../../../lib/api-client";
import { EntitiesResponseSchema, type EntitiesResponse } from "../validators/entities.schema";

export const entitiesKeys = {
  all: ["entities"] as const,
  list: () => [...entitiesKeys.all, "list"] as const,
  detail: (id: string) => [...entitiesKeys.all, "detail", id] as const,
};
export type EntitiesKeys = typeof entitiesKeys;

/** GET /api/v1/entites */
export async function fetchEntities(signal?: AbortSignal): Promise<EntitiesResponse> {
  return apiRequest("/entites", EntitiesResponseSchema, { signal });
}
