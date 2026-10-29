import { apiRequest } from "../../../lib/api-client";
import { InvestigationCreateSchema, InvestigationSchema, InvestigationsResponseSchema, type InvestigationsResponse } from "../validators/investigations.schema";

export const investigationsKeys = {
  all: ["investigations"] as const,
  list: () => [...investigationsKeys.all, "list"] as const,
  detail: (id: string) => [...investigationsKeys.all, "detail", id] as const,
};
export type InvestigationsKeys = typeof investigationsKeys;
export async function fetchInvestigations(signal?: AbortSignal): Promise<InvestigationsResponse> {
  return apiRequest("/investigations", InvestigationsResponseSchema, { signal });
}
export async function createInvestigation(payload: { nom: string; description?: string }) {
  const body = InvestigationCreateSchema.parse({ nom: payload.nom, description: payload.description ?? "" });
  return apiRequest("/investigations", InvestigationSchema, { method: "POST", body });
}
