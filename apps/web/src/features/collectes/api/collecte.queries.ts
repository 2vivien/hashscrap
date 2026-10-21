import { useQuery } from "@tanstack/react-query";
import { MOCK_COLLECTES } from "../mocks/collecte.mock";
import type { Collecte } from "../types/collecte.types";

export const collectesKeys = {
  all: ["collectes"] as const,
  list: () => [...collectesKeys.all, "list"] as const,
  detail: (id: string) => [...collectesKeys.all, "detail", id] as const,
} as const;

export type CollectesKeys = typeof collectesKeys;

/**
 * Demo fetcher: the collection API is not exposed by the engine yet.
 * Replace it with the versioned /api/v1/collectes contract when it lands.
 */
export async function fetchCollectes(): Promise<Collecte[]> {
  return MOCK_COLLECTES;
}

export function useCollectes() {
  return useQuery({
    queryKey: collectesKeys.list(),
    queryFn: fetchCollectes,
    staleTime: 30_000,
  });
}
