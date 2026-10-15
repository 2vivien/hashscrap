/**
 * Read-only client for the HashScrap API contract (`hashscrap/api.py`).
 *
 * Only endpoints that actually exist are called here. There is no write route:
 * source creation, crawl launch, retry and export generation stay unavailable
 * until their own contracts expose permissions, audit and error states.
 */

/** Statuses the persistence layer accepts for a crawl run. */
export const RUN_STATUSES = [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
] as const;

export type RunStatus = (typeof RUN_STATUSES)[number];

/**
 * Shape of `RunResponse` returned by `GET /api/v1/runs`.
 * Every field here exists server-side; nothing is derived or invented.
 */
export type ApiRun = {
  id: string;
  job_id: string;
  source_key: string | null;
  status: string;
  started_at: string;
  finished_at: string | null;
  fetched_count: number;
  failed_count: number;
  bytes_received: number;
};

/** Raised for every failure mode so the UI can render one honest error state. */
export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Base URL of the API. Empty by default, which calls the API on the same
 * origin (the deployment topology). Override with `VITE_API_BASE_URL` in dev.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

/** Absolute URL for the bounded runs endpoint. Bounds are sent, never guessed. */
export function runsEndpoint(limit: number): string {
  return `${API_BASE}/api/v1/runs?limit=${limit}`;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isApiRun(value: unknown): value is ApiRun {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const run = value as Record<string, unknown>;
  return (
    typeof run.id === "string" &&
    typeof run.status === "string" &&
    typeof run.started_at === "string" &&
    typeof run.fetched_count === "number" &&
    typeof run.failed_count === "number"
  );
}

/**
 * Fetch the most recent runs. The server bounds the response (`limit` 1..100);
 * an empty array is a truthful "no run recorded", not an error.
 */
export async function fetchRuns(limit = 20, signal?: AbortSignal): Promise<ApiRun[]> {
  let response: Response;
  try {
    response = await fetch(runsEndpoint(limit), {
      headers: { accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ApiError(
      "API injoignable : la requête vers GET /api/v1/runs n’a pas abouti. Aucune donnée n’est affichée à la place.",
    );
  }

  if (!response.ok) {
    throw new ApiError(
      `Le service a répondu ${response.status} ${response.statusText || ""}`.trim() +
        ". Aucune donnée n’est affichée à la place.",
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("Réponse illisible : le service n’a pas renvoyé de JSON valide.");
  }

  if (!Array.isArray(payload) || !payload.every(isApiRun)) {
    throw new ApiError("Réponse inattendue : le contrat GET /api/v1/runs n’est pas respecté.");
  }

  return payload;
}
