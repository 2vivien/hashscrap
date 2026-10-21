import { useQuery } from "@tanstack/react-query";
import { MOCK_PREUVES } from "../mocks/preuves.mock";
import type { Preuve } from "../types/preuves.types";

export const preuvesKeys = {
  all: ["preuves"] as const,
  list: () => [...preuvesKeys.all, "list"] as const,
  detail: (id: string) => [...preuvesKeys.all, "detail", id] as const,
} as const;

export type PreuvesKeys = typeof preuvesKeys;

/**
 * Demo fetcher: documents and observations are not exposed by the engine yet.
 */
export async function fetchPreuves(): Promise<Preuve[]> {
  return MOCK_PREUVES;
}

export function usePreuves() {
  return useQuery({
    queryKey: preuvesKeys.list(),
    queryFn: fetchPreuves,
    staleTime: 60_000,
  });
}
