import { apiRequest } from "../../../lib/api-client";
import { CollecteLaunchSchema, CollecteSchema, CollectesResponseSchema, type CollectesResponse } from "../validators/collectes.schema";
import type { Collecte } from "../types/collectes.types";

export const collectesKeys = {
  all: ["collectes"] as const,
  list: () => [...collectesKeys.all, "list"] as const,
  detail: (id: string) => [...collectesKeys.all, "detail", id] as const,
};
export type CollectesKeys = typeof collectesKeys;
export async function fetchCollectes(signal?: AbortSignal): Promise<CollectesResponse> {
  return apiRequest("/collectes", CollectesResponseSchema, { signal });
}
export async function launchCollecte(payload: { source: string; url: string }): Promise<Collecte> {
  const body = CollecteLaunchSchema.parse(payload);
  return apiRequest("/collectes", CollecteSchema, { method: "POST", body });
}
