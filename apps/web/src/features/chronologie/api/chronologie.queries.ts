import { apiRequest } from "../../../lib/api-client";
import { ChronologieResponseSchema, type ChronologieResponse } from "../validators/chronologie.schema";

export const chronologieKeys = {
  all: ["chronologie"] as const,
  list: () => [...chronologieKeys.all, "list"] as const,
};
export type ChronologieKeys = typeof chronologieKeys;

/** GET /api/v1/chronologie */
export async function fetchChronologie(signal?: AbortSignal): Promise<ChronologieResponse> {
  return apiRequest("/chronologie", ChronologieResponseSchema, { signal });
}
