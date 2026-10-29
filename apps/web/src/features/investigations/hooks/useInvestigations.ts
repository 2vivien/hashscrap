import { useQuery } from "@tanstack/react-query";
import { investigationsKeys, fetchInvestigations } from "../api/investigations.queries";

interface UseInvestigationsOptions {
  // Add any options if needed
}

export function useInvestigations({}: UseInvestigationsOptions = {}) {
  return useQuery({
    queryKey: investigationsKeys.list(),
    queryFn: ({ signal }) => fetchInvestigations(signal),
    staleTime: 30_000,
  });
}