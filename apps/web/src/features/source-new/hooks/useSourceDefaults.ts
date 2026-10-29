import { useQuery } from "@tanstack/react-query";
import { fetchSourceDefaults, sourceNewKeys } from "../api/source-new.queries";

export function useSourceDefaults() {
  return useQuery({
    queryKey: sourceNewKeys.defaults(),
    queryFn: ({ signal }) => fetchSourceDefaults(signal),
    staleTime: 300_000,
  });
}
