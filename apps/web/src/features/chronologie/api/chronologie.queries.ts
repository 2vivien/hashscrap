import { useQuery } from "@tanstack/react-query";
import { MOCK_CHRONOLOGIE } from "../mocks/chronologie.mock";
import type { EvenementTimeline } from "../types/chronologie.types";

export const chronologieKeys = {
  all: ["chronologie"] as const,
  list: () => [...chronologieKeys.all, "list"] as const,
} as const;

export type ChronologieKeys = typeof chronologieKeys;

/**
 * Demo fetcher: the timeline endpoint is not exposed by the engine yet.
 */
export async function fetchChronologie(): Promise<EvenementTimeline[]> {
  return MOCK_CHRONOLOGIE;
}

export function useChronologie() {
  return useQuery({
    queryKey: chronologieKeys.list(),
    queryFn: fetchChronologie,
    staleTime: 60_000,
  });
}
