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