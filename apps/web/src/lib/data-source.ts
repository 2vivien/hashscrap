/**
 * Data source used by the feature hooks.
 *
 * The interface runs standalone on typed JSON fixtures. The engine API is
 * intentionally not consumed here: the mock data is the source of truth for
 * the frontend until a backend contract is approved.
 */
export type DataSource = "mock";

export const dataSource: DataSource = "mock";

export function isMockSource(): boolean {
  return true;
}
