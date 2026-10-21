import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_COLLECTES } from "../mocks/collectes.mock";
import {
  CollectesResponseSchema,
  type CollectesResponse,
} from "../validators/collectes.schema";

export const collectesKeys = {
  all: ["collectes"] as const,
  list: () => [...collectesKeys.all, "list"] as const,
  detail: (id: string) => [...collectesKeys.all, "detail", id] as const,
};

export type CollectesKeys = typeof collectesKeys;

/** Read the collection jobs exposed by the engine. */
export async function fetchCollectes(signal?: AbortSignal): Promise<CollectesResponse> {
  if (isMockSource()) {
    return MOCK_COLLECTES;
  }
  return apiRequest("/collectes", CollectesResponseSchema, { signal });
}
