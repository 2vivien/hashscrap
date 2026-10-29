import { useQuery } from "@tanstack/react-query";
import { dashboardKeys, fetchDashboard } from "../api/dashboard.queries";

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: ({ signal }) => fetchDashboard(signal),
    staleTime: 30_000,
  });
}
