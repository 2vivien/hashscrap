/**
 * Shared types and pure formatters for the read-only HashScrap contract.
 *
 * Kept free of any server-only import so route components can render values without
 * pulling the API client into the browser bundle.
 */

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

/** JSON values only: `unknown` is not serializable across the server boundary. */
export type ApiLimits = Record<string, string | number | boolean>;

export type ApiSource = {
  id: string;
  source_key: string;
  base_url: string | null;
  enabled: boolean;
  allowed_hosts: string[];
  limits: ApiLimits;
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

/**
 * Result envelope used across the server boundary. A single object shape keeps the
 * payload serializable, and a failed request keeps `data` null so a missing value is
 * never replaced by a fabricated one.
 */
export type ApiResult<T> = {
  data: T | null;
  problem: ApiProblem | null;
};

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