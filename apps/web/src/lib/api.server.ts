/**
 * Server-side client for the read-only HashScrap API.
 *
 * Loaded only from route loaders, so the database stays private and the browser never
 * talks to the API directly. The contract is versioned and read-only: no write helper
 * exists on purpose.
 */
export const API_BASE_URL =
  process.env.HASHSCRAP_API_URL ?? "http://127.0.0.1:8000";

export type ApiSummary = {
  sources: number;
  documents: number;
  observations: number;
  entities: number;
  runs_total: number;
  runs_succeeded: number;
  runs_failed: number;
  observations_pending_review: number;
  last_run_at: string | null;
};

export type ApiSource = {
  id: string;
  source_key: string;
  base_url: string | null;
  enabled: boolean;
  allowed_hosts: string[];
  limits: Record<string, unknown>;
};

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

export type ApiDocument = {
  id: string;
  original_url: string;
  canonical_url: string | null;
  status_code: number | null;
  media_type: string | null;
  content_sha256: string | null;
  first_seen_at: string;
  last_seen_at: string;
  observations_count: number;
};

export type ApiDocumentsPage = {
  total: number;
  items: ApiDocument[];
};

export type ApiProblem = {
  reason: "unreachable" | "invalid_response";
  message: string;
};

export type ApiResult<T> = { data: T; problem: null } | { data: null; problem: ApiProblem };

const REQUEST_TIMEOUT_MS = 5_000;

async function getJson<T>(path: string): Promise<ApiResult<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return {
        data: null,
        problem: {
          reason: "invalid_response",
          message: `L’API a répondu ${response.status}.`,
        },
      };
    }
    return { data: (await response.json()) as T, problem: null };
  } catch {
    return {
      data: null,
      problem: {
        reason: "unreachable",
        message: "Le service de données n’a pas répondu.",
      },
    };
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

export type RunTone = "success" | "warning" | "error" | "neutral";

/** A run status always carries a text label; the tone only adds a visual cue. */
export function runTone(status: string): RunTone {
  if (status === "succeeded") return "success";
  if (status === "failed") return "error";
  if (status === "running" || status === "queued") return "warning";
  return "neutral";
}

export function runLabel(status: string): string {
  switch (status) {
    case "succeeded":
      return "Terminée";
    case "failed":
      return "Échouée";
    case "running":
      return "En cours";
    case "queued":
      return "En attente";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} o`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} Ko`;
  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(parsed);
}

export function shortHash(value: string | null): string {
  if (!value) return "—";
  return value.length <= 12 ? value : `${value.slice(0, 12)}…`;
}