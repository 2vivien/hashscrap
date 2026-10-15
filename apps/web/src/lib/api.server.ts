/**
 * Server-only client for the read-only HashScrap API.
 *
 * Imported exclusively from route loaders, so the database stays private and the browser
 * never talks to the API directly. No write helper exists on purpose.
 */
import type {
  ApiDocumentsPage,
  ApiProblem,
  ApiResult,
  ApiRun,
  ApiSource,
  ApiSummary,
} from "./api-format";

/**
 * Read `HASHSCRAP_API_URL` without depending on Node type definitions, so the module
 * type-checks in both the server and the test environments.
 */
const serverEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> };
}).process?.env;

export const API_BASE_URL = serverEnv?.HASHSCRAP_API_URL ?? "http://127.0.0.1:8001";

const REQUEST_TIMEOUT_MS = 5_000;

async function getJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      const problem: ApiProblem = {
        reason: "invalid_response",
        message: `L’API a répondu ${response.status}.`,
      };
      return { data: null, problem };
    }
    return { data: (await response.json()) as T, problem: null };
  } catch {
    const problem: ApiProblem = {
      reason: "unreachable",
      message: "Le service de données n’a pas répondu.",
    };
    return { data: null, problem };
  }
}

export function fetchSummary(): Promise<ApiResult<ApiSummary>> {
  return getJson<ApiSummary>("/api/v1/summary");
}

export function fetchRuns(limit = 10): Promise<ApiResult<ApiRun[]>> {
  return getJson<ApiRun[]>(`/api/v1/runs?limit=${limit}`);
}

export function fetchDocuments(limit = 10): Promise<ApiResult<ApiDocumentsPage>> {
  return getJson<ApiDocumentsPage>(`/api/v1/documents?limit=${limit}`);
}

export function fetchSources(): Promise<ApiResult<ApiSource[]>> {
  return getJson<ApiSource[]>("/api/v1/sources");
}