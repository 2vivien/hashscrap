import { useQuery } from "@tanstack/react-query";
import { fetchPreuves, preuvesKeys } from "../api/preuves.queries";

/** Read the proofs exposed by the engine. */
export function usePreuves() {
  return useQuery({
    queryKey: preuvesKeys.list(),
    queryFn: ({ signal }) => fetchPreuves(signal),
    staleTime: 30_000,
  });
}
