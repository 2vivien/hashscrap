import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_SOURCE_NEW_DEFAULTS } from "../mocks/source-new.mock";
import { ParametresSchema, type SourceNewDefaults } from "../validators/source-new.schema";

export const sourceNewKeys = {
  all: ["source-new"] as const,
  defaults: () => [...sourceNewKeys.all, "defaults"] as const,
};

export type SourceNewKeys = typeof sourceNewKeys;

/** Read the default collector limits proposed when creating a source. */
export async function fetchSourceDefaults(signal?: AbortSignal): Promise<SourceNewDefaults> {
  if (isMockSource()) {
    return MOCK_SOURCE_NEW_DEFAULTS;
  }
  const parametres = await apiRequest("/parametres", ParametresSchema, { signal });
  return {
    limits: {
      timeout_seconds: parametres.collecteur.timeout,
      concurrency: 2,
      requests_per_second: parametres.collecteur.requests_per_second,
      max_depth: parametres.collecteur.depth,
      max_pages: parametres.collecteur.max_pages,
      max_response_bytes: 1_000_000,
    },
    checklist: { protocol_https: true, dns: true, accessibilite: true },
  };
}
