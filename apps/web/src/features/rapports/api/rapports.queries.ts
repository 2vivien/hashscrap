import { apiRequest } from "../../../lib/api-client";
import { RapportGenerateSchema, RapportSchema, RapportsResponseSchema, type RapportsResponse } from "../validators/rapports.schema";

export const rapportsKeys = {
  all: ["rapports"] as const,
  list: () => [...rapportsKeys.all, "list"] as const,
  detail: (id: string) => [...rapportsKeys.all, "detail", id] as const,
};
export type RapportsKeys = typeof rapportsKeys;
export async function fetchRapports(signal?: AbortSignal): Promise<RapportsResponse> {
  return apiRequest("/rapports", RapportsResponseSchema, { signal });
}
export async function generateRapport(payload: { titre: string; investigation?: string }) {
  const body = RapportGenerateSchema.parse({ titre: payload.titre, investigation: payload.investigation ?? "" });
  return apiRequest("/rapports", RapportSchema, { method: "POST", body });
}
