import { useQuery } from "@tanstack/react-query";
import { MOCK_RAPPORTS } from "../mocks/rapports.mock";
import type { Rapport } from "../types/rapports.types";

export const rapportsKeys = {
  all: ["rapports"] as const,
  list: () => [...rapportsKeys.all, "list"] as const,
  detail: (id: string) => [...rapportsKeys.all, "detail", id] as const,
} as const;

export type RapportsKeys = typeof rapportsKeys;

/**
 * Demo fetcher: report generation has no endpoint yet.
 */
export async function fetchRapports(): Promise<Rapport[]> {
  return MOCK_RAPPORTS;
}

export function useRapports() {
  return useQuery({
    queryKey: rapportsKeys.list(),
    queryFn: fetchRapports,
    staleTime: 60_000,
  });
}
