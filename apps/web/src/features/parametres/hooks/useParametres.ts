import { useQuery } from "@tanstack/react-query";
import { fetchParametres, parametresKeys } from "../api/parametres.queries";

/** Read the engine settings exposed by the engine. */
export function useParametres() {
  return useQuery({
    queryKey: parametresKeys.detail(),
    queryFn: ({ signal }) => fetchParametres(signal),
    staleTime: 30_000,
  });
}
