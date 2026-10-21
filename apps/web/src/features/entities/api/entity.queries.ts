import { useQuery } from "@tanstack/react-query";
import { MOCK_ENTITIES } from "../mocks/entity.mock";
import type { Entity } from "../types/entity.types";

export const entitiesKeys = {
  all: ["entities"] as const,
  list: () => [...entitiesKeys.all, "list"] as const,
  detail: (id: string) => [...entitiesKeys.all, "detail", id] as const,
} as const;

export type EntitiesKeys = typeof entitiesKeys;

/**
 * Demo fetcher: the correlation API is not exposed by the engine yet.
 */
export async function fetchEntities(): Promise<Entity[]> {
  return MOCK_ENTITIES;
}

export function useEntities() {
  return useQuery({
    queryKey: entitiesKeys.list(),
    queryFn: fetchEntities,
    staleTime: 30_000,
  });
}
