import { useQuery } from "@tanstack/react-query";
import { collectesKeys, fetchCollectes } from "../api/collectes.queries";

export function useCollectes() {
  return useQuery({
    queryKey: collectesKeys.list(),
    queryFn: ({ signal }) => fetchCollectes(signal),
    staleTime: 30_000,
  });
}
