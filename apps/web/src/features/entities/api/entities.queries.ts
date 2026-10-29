import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_ENTITIES } from "../mocks/entities.mock";
import {
  EntitiesResponseSchema,
  type EntitiesResponse,
} from "../validators/entities.schema";

/** Query keys for the entities feature. */
export const entitiesKeys = {
  all: ["entities"] as const,
  list: () => [...entitiesKeys.all, "list"] as const,
  detail: (id: string) => [...entitiesKeys.all, "detail", id] as const,
};

export type EntitiesKeys = typeof entitiesKeys;

/** Read the entities exposed by the engine. */
export async function fetchEntities(signal?: AbortSignal): Promise<EntitiesResponse> {
  if (isMockSource()) {
    return MOCK_ENTITIES;
  }
  return apiRequest("/entites", EntitiesResponseSchema, { signal });
}