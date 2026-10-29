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
