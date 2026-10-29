import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_PARAMETRES } from "../mocks/parametres.mock";
import {
  ParametresSchema,
  type ParametresPayload,
} from "../validators/parametres.schema";

export const parametresKeys = {
  all: ["parametres"] as const,
  detail: () => [...parametresKeys.all, "detail"] as const,
};

export type ParametresKeys = typeof parametresKeys;

/** Read the engine settings exposed by the engine. */
export async function fetchParametres(signal?: AbortSignal): Promise<ParametresPayload> {
  if (isMockSource()) {
    return MOCK_PARAMETRES;
  }
  return apiRequest("/parametres", ParametresSchema, { signal });
}
