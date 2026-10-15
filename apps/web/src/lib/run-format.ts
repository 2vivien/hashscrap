/**
 * Pure, deterministic formatting helpers for crawl run values.
 *
 * Timestamps from the API are UTC ISO strings; they are rendered in UTC with an
 * explicit suffix so the analyst never has to guess the timezone. All helpers are
 * total: a missing value renders as an em dash, never as an invented value.
 */

const UNKNOWN = "—";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

/** Format an ISO UTC timestamp as `JJ/MM/AAAA HH:MM:SS UTC`. */
export function formatDateTimeUtc(value: string | null | undefined): string {
  if (!value) {
    return UNKNOWN;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return UNKNOWN;
  }
  return `${dateTimeFormatter.format(date)} UTC`;
}

/** Short, stable identifier derived from the UUID the API returned. */
export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id;
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Human-readable byte size. Base 1024, one decimal for KB and above. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return UNKNOWN;
  }
  if (bytes < 1024) {
    return `${bytes} o`;
  }
  const units = ["Ko", "Mo", "Go", "To"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/** Processing counters, honest about failures instead of a fabricated progress bar. */
export function formatProcessing(fetched: number, failed: number): string {
  return `${pluralize(fetched, "page", "pages")} · ${pluralize(failed, "échec", "échecs")}`;
}

/**
 * Duration between start and finish. A run without `finished_at` is still
 * running: we say so rather than computing a moving duration.
 */
export function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) {
    return "En cours";
  }
  const start = new Date(startedAt).getTime();
  const finish = new Date(finishedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(finish)) {
    return UNKNOWN;
  }
  const totalSeconds = Math.max(0, Math.round((finish - start) / 1000));
  if (totalSeconds < 60) {
    return `${totalSeconds} s`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} h ${remainingMinutes} min`;
}
