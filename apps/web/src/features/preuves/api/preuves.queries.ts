import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_PREUVES } from "../mocks/preuves.mock";
import {
  PreuvesResponseSchema,
  type PreuvesResponse,
} from "../validators/preuves.schema";

export const preuvesKeys = {
  all: ["preuves"] as const,
  list: () => [...preuvesKeys.all, "list"] as const,
  detail: (id: string) => [...preuvesKeys.all, "detail", id] as const,
};

export type PreuvesKeys = typeof preuvesKeys;

/** Read the proofs exposed by the engine. */
export async function fetchPreuves(signal?: AbortSignal): Promise<PreuvesResponse> {
  if (isMockSource()) {
    return MOCK_PREUVES;
  }
  return apiRequest("/preuves", PreuvesResponseSchema, { signal });
}
