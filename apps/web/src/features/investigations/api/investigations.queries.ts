import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_INVESTIGATIONS } from "../mocks/investigations.mock";
import {
  InvestigationsResponseSchema,
  type InvestigationsResponse,
} from "../validators/investigations.schema";

/** Read the investigations exposed by the engine. */
export async function fetchInvestigations(signal?: AbortSignal): Promise<InvestigationsResponse> {
  if (isMockSource()) {
    return MOCK_INVESTIGATIONS;
  }
  return apiRequest("/investigations", InvestigationsResponseSchema, { signal });
}

export const investigationsKeys = {
  all: ["investigations"] as const,
  list: () => [...investigationsKeys.all, "list"] as const,
  detail: (id: string) => [...investigationsKeys.all, "detail", id] as const,
};

export type InvestigationsKeys = typeof investigationsKeys;

/** Create a new investigation in the engine. */
export async function createInvestigation(payload: { nom: string; description: string }) {
  if (isMockSource()) {
    return {
      id: `inv-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`,
      nom: payload.nom,
      description: payload.description,
      statut: "en_cours" as const,
      sources: 0,
      observations: 0,
      derniere_activite: new Date().toISOString(),
    };
  }
  const { apiRequest } = await import("../../../lib/api-client");
  const { InvestigationSchema } = await import("../validators/investigations.schema");
  return apiRequest("/investigations", InvestigationSchema, { method: "POST", body: payload });
}
