import { useQuery } from "@tanstack/react-query";
import { MOCK_SOURCES } from "../mocks/source.mock";
import type { Source } from "../types/source.types";

export const sourcesKeys = {
  all: ["sources"] as const,
  list: () => [...sourcesKeys.all, "list"] as const,
  detail: (id: string) => [...sourcesKeys.all, "detail", id] as const,
} as const;

export type SourcesKeys = typeof sourcesKeys;

/**
 * Demo fetcher: the source registry is not exposed as an API yet.
 * Replace it with the versioned /api/v1/sources contract when it lands.
 */
export async function fetchSources(): Promise<Source[]> {
  return MOCK_SOURCES;
}

export function useSources() {
  return useQuery({
    queryKey: sourcesKeys.list(),
    queryFn: fetchSources,
    staleTime: 30_000,
  });
}
