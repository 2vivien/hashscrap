/** Formatting helpers shared by the screens. */

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(value: string | Date): string {
  return DATE_FORMAT.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return DATE_TIME_FORMAT.format(new Date(value));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatBytes(value: number): string {
  if (value < 1024) return `${value} o`;
  const units = ["Ko", "Mo", "Go"];
  let size = value / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(1).replace(".", ",")} ${units[unit]}`;
}

export function truncateHash(value: string, length = 12): string {
  return value.length > length ? `${value.slice(0, length)}...` : value;
}
