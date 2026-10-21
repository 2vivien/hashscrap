import { useQuery } from "@tanstack/react-query";
import { MOCK_COLLECTE_DETAIL } from "../mocks/collecte-detail.mock";
import type { CollecteDetail } from "../types/collecte-detail.types";

export const collecteDetailKeys = {
  all: ["collecte-detail"] as const,
  detail: (id: string) => [...collecteDetailKeys.all, "detail", id] as const,
} as const;

export type CollecteDetailKeys = typeof collecteDetailKeys;

/**
 * Demo fetcher: the crawl job and journal endpoints are not exposed yet.
 */
export async function fetchCollecteDetail(id: string): Promise<CollecteDetail> {
  return { ...MOCK_COLLECTE_DETAIL, id };
}

export function useCollecteDetail(id: string) {
  return useQuery({
    queryKey: collecteDetailKeys.detail(id),
    queryFn: () => fetchCollecteDetail(id),
    staleTime: 60_000,
  });
}
