import { useQuery } from "@tanstack/react-query";
import { entityDetailKeys, fetchEntityDetail } from "../api/entity-detail.queries";

/** Read the entity detail exposed by the engine. */
export function useEntityDetail(id: string) {
  return useQuery({
    queryKey: entityDetailKeys.detail(id),
    queryFn: ({ signal }) => fetchEntityDetail(id, signal),
    enabled: !!id,
    staleTime: 30_000,
  });
}