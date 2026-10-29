import { useQuery } from '@tanstack/react-query';
import { fetchDashboard } from '../api/dashboard.queries';

const DASHBOARD_QUERY_KEY = ['dashboard'];

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboard,
  });
}
