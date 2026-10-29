import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_RAPPORTS } from "../mocks/rapports.mock";
import {
  RapportsResponseSchema,
  type RapportsResponse,
} from "../validators/rapports.schema";

export const rapportsKeys = {
  all: ["rapports"] as const,
  list: () => [...rapportsKeys.all, "list"] as const,
  detail: (id: string) => [...rapportsKeys.all, "detail", id] as const,
};

export type RapportsKeys = typeof rapportsKeys;

/** Read the reports exposed by the engine. */
export async function fetchRapports(signal?: AbortSignal): Promise<RapportsResponse> {
  if (isMockSource()) {
    return MOCK_RAPPORTS;
  }
  return apiRequest("/rapports", RapportsResponseSchema, { signal });
}


/** Generate a new report in the engine. */
export async function generateRapport(payload: { titre: string; investigation: string }) {
  if (isMockSource()) {
    return {
      id: `r-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001`,
      titre: payload.titre,
      investigation: payload.investigation,
      statut: "en_attente" as const,
      genere_le: new Date().toISOString(),
      format: "markdown" as const,
      contenu: "# " + payload.titre + "\n\nContenu à générer.",
    };
  }
  const { apiRequest } = await import("../../../lib/api-client");
  const { RapportSchema } = await import("../validators/rapports.schema");
  return apiRequest("/rapports", RapportSchema, { method: "POST", body: payload });
}
