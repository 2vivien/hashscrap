import { apiRequest } from "../../../lib/api-client";
import { DashboardSchema, type DashboardPayload } from "../validators/dashboard.schema";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};
export type DashboardKeys = typeof dashboardKeys;

/** GET /api/v1/dashboard — always use persisted engine data. */
export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardPayload> {
  return apiRequest("/dashboard", DashboardSchema, { signal });
}
