import { DashboardResponseSchema } from '../validators/dashboard.schema';
import { MOCK_DASHBOARD } from '../mocks/dashboard.mock';
import { apiRequest } from '../../../lib/api-client';
import { isMockSource } from '../../../lib/data-source';

export async function fetchDashboard(signal?: AbortSignal) {
  if (isMockSource()) return MOCK_DASHBOARD;
  return apiRequest('/dashboard', DashboardResponseSchema, { signal });
}
