import { apiRequest } from "../../../lib/api-client";
import { SourceSchema, SourcesResponseSchema, type SourcePayload, type SourcesResponse } from "../validators/sources.schema";

export const sourcesKeys = {
  all: ["sources"] as const,
  list: () => [...sourcesKeys.all, "list"] as const,
  detail: (id: string) => [...sourcesKeys.all, "detail", id] as const,
};
export type SourcesKeys = typeof sourcesKeys;
export type SourceType = SourcePayload["type"];

/** GET /api/v1/sources */
export async function fetchSources(signal?: AbortSignal): Promise<SourcesResponse> {
  return apiRequest("/sources", SourcesResponseSchema, { signal });
}

/** POST /api/v1/sources — fields are exactly SourceCreateIn. */
export async function createSource(payload: { nom: string; url: string; type: SourceType; domaines: string[] }): Promise<SourcePayload> {
  return apiRequest("/sources", SourceSchema, { method: "POST", body: payload });
}
