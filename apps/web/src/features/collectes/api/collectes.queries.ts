import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_COLLECTES } from "../mocks/collectes.mock";
import {
  CollecteSchema,
  CollectesResponseSchema,
  type CollectesResponse,
} from "../validators/collectes.schema";
import type { Collecte } from "../types/collectes.types";

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


/** Launch a new collection job in the engine. */
export async function launchCollecte(payload: { source: string; url: string }): Promise<Collecte> {
  if (isMockSource()) {
    return {
      id: `C-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`,
      source: payload.source,
      type: "web",
      status: "en_cours",
      progress: 0,
      pages: 0,
      duration: "0h00m",
      started_at: new Date().toISOString(),
    };
  }
  return apiRequest("/collectes", CollecteSchema, { method: "POST", body: payload });
}
