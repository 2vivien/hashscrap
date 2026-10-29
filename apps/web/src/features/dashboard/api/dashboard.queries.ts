import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_DASHBOARD } from "../mocks/dashboard.mock";
import { DashboardSchema, type DashboardPayload } from "../validators/dashboard.schema";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
};

export type DashboardKeys = typeof dashboardKeys;

/** Read the aggregated activity exposed by the engine. */
export async function fetchDashboard(signal?: AbortSignal): Promise<DashboardPayload> {
  if (isMockSource()) {
    return MOCK_DASHBOARD;
  }
  return apiRequest("/dashboard", DashboardSchema, { signal });
}
