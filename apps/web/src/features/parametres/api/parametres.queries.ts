import { apiRequest } from "../../../lib/api-client";
import { ParametresSchema, ParametresUpdateSchema, type ParametresPayload, type ParametresUpdatePayload } from "../validators/parametres.schema";

export const parametresKeys = {
  all: ["parametres"] as const,
  detail: () => [...parametresKeys.all, "detail"] as const,
};
export type ParametresKeys = typeof parametresKeys;

/** GET /api/v1/parametres */
export async function fetchParametres(signal?: AbortSignal): Promise<ParametresPayload> {
  return apiRequest("/parametres", ParametresSchema, { signal });
}

/** PUT /api/v1/parametres persists only the provided settings sections. */
export async function updateParametres(payload: ParametresUpdatePayload): Promise<ParametresPayload> {
  const parsed = ParametresUpdateSchema.parse(payload);
  return apiRequest("/parametres", ParametresSchema, { method: "PUT", body: parsed });
}
