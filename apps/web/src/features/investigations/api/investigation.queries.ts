import { useQuery } from "@tanstack/react-query";
import { MOCK_INVESTIGATIONS } from "../mocks/investigation.mock";
import type { Investigation } from "../types/investigation.types";

export const investigationsKeys = {
  all: ["investigations"] as const,
  list: () => [...investigationsKeys.all, "list"] as const,
  detail: (id: string) => [...investigationsKeys.all, "detail", id] as const,
} as const;

export type InvestigationsKeys = typeof investigationsKeys;

/**
 * Demo fetcher: investigations are not persisted by the engine yet.
 */
export async function fetchInvestigations(): Promise<Investigation[]> {
  return MOCK_INVESTIGATIONS;
}

export function useInvestigations() {
  return useQuery({
    queryKey: investigationsKeys.list(),
    queryFn: fetchInvestigations,
    staleTime: 30_000,
  });
}
