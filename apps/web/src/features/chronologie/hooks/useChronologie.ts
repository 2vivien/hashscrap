import { useQuery } from "@tanstack/react-query";
import { chronologieKeys, fetchChronologie } from "../api/chronologie.queries";

/** Read the timeline events exposed by the engine. */
export function useChronologie() {
  return useQuery({
    queryKey: chronologieKeys.list(),
    queryFn: ({ signal }) => fetchChronologie(signal),
    staleTime: 30_000,
  });
}