import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_SOURCES } from "../mocks/sources.mock";
import { SourcesResponseSchema, type SourcesResponse } from "../validators/sources.schema";

export const sourcesKeys = {
  all: ["sources"] as const,
  list: () => [...sourcesKeys.all, "list"] as const,
  detail: (id: string) => [...sourcesKeys.all, "detail", id] as const,
};

export type SourcesKeys = typeof sourcesKeys;

/** Read the source registry exposed by the engine. */
export async function fetchSources(signal?: AbortSignal): Promise<SourcesResponse> {
  if (isMockSource()) {
    return MOCK_SOURCES;
  }
  return apiRequest("/sources", SourcesResponseSchema, { signal });
}
