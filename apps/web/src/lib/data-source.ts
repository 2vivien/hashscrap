/**
 * Data source used by the feature hooks.
 *
 * `api` reads the versioned engine API. `mock` reads the typed JSON fixtures
 * shipped with each feature, which keeps the interface usable before the
 * engine is reachable.
 */
export type DataSource = "api" | "mock";

const configured = import.meta.env.VITE_DATA_SOURCE;

export const dataSource: DataSource = configured === "mock" ? "mock" : "api";

export function isMockSource(): boolean {
  return dataSource === "mock";
}
