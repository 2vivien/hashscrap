import { useQuery } from "@tanstack/react-query";
import { fetchRapports, rapportsKeys } from "../api/rapports.queries";

/** Read the reports exposed by the engine. */
export function useRapports() {
  return useQuery({
    queryKey: rapportsKeys.list(),
    queryFn: ({ signal }) => fetchRapports(signal),
    staleTime: 30_000,
  });
}
