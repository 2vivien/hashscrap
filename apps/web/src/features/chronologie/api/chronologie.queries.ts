import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_CHRONOLOGIE } from "../mocks/chronologie.mock";
import {
  ChronologieResponseSchema,
  type ChronologieResponse,
} from "../validators/chronologie.schema";

/** Query keys for the chronologie feature. */
export const chronologieKeys = {
  all: ["chronologie"] as const,
  list: () => [...chronologieKeys.all, "list"] as const,
};

export type ChronologieKeys = typeof chronologieKeys;

/** Read the timeline events exposed by the engine. */
export async function fetchChronologie(signal?: AbortSignal): Promise<ChronologieResponse> {
  if (isMockSource()) {
    return MOCK_CHRONOLOGIE;
  }
  return apiRequest("/chronologie", ChronologieResponseSchema, { signal });
}