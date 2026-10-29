import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_SOURCES } from "../mocks/sources.mock";
import { SourceSchema, SourcesResponseSchema, type SourcePayload, type SourcesResponse } from "../validators/sources.schema";

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

/** Create a new source in the engine. */
export async function createSource(payload: {
  nom: string;
  url: string;
  type: string;
  domaines: string[];
}): Promise<SourcePayload> {
  if (isMockSource()) {
    return {
      id: payload.nom.toLowerCase().replace(/ /g, "-"),
      nom: payload.nom,
      url: payload.url,
      type: payload.type as SourcePayload["type"],
      statut: "validee",
      derniere_collecte: null,
      domaines: payload.domaines,
    };
  }
  return apiRequest("/sources", SourceSchema, { method: "POST", body: payload });
}
