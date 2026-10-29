import { apiRequest } from "../../../lib/api-client";
import { PreuvesResponseSchema, type PreuvesResponse } from "../validators/preuves.schema";

export const preuvesKeys = {
  all: ["preuves"] as const,
  list: () => [...preuvesKeys.all, "list"] as const,
  detail: (id: string) => [...preuvesKeys.all, "detail", id] as const,
};
export type PreuvesKeys = typeof preuvesKeys;

/** GET /api/v1/preuves */
export async function fetchPreuves(signal?: AbortSignal): Promise<PreuvesResponse> {
  return apiRequest("/preuves", PreuvesResponseSchema, { signal });
}
