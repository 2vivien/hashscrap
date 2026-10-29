import { useQuery } from "@tanstack/react-query";
import { fetchSources, sourcesKeys } from "../api/sources.queries";

export function useSources() {
  return useQuery({
    queryKey: sourcesKeys.list(),
    queryFn: ({ signal }) => fetchSources(signal),
    staleTime: 30_000,
  });
}
