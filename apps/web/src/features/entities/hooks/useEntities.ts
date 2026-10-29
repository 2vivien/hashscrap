import { useQuery } from "@tanstack/react-query";
import { entitiesKeys, fetchEntities } from "../api/entities.queries";

/** Read the entities exposed by the engine. */
export function useEntities() {
  return useQuery({
    queryKey: entitiesKeys.list(),
    queryFn: ({ signal }) => fetchEntities(signal),
    staleTime: 30_000,
  });
}