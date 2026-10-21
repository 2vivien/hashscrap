import { z } from "zod";
import type { Collecte } from "../types/collecte.types";

export const CollecteStatusSchema = z.enum(["en_cours", "terminee", "echouee", "annulee"]);

export const CollecteSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  type: z.enum(["Web", "Réseau", "API"]),
  statut: CollecteStatusSchema,
  progression: z.number().min(0).max(100),
  pages: z.object({ collecte: z.number().min(0), total: z.number().min(0) }),
  duree: z.string().min(1),
  demarre: z.string().min(1),
});

export type CollectePayload = z.infer<typeof CollecteSchema>;

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type Assert<T extends true> = T;

/** Compile-time guard: the Zod contract must stay aligned with the shared type. */
export type CollecteSchemaMatchesType = Assert<Equals<CollectePayload, Collecte>>;

export function validateCollecte(data: unknown): z.ZodSafeParseResult<CollectePayload> {
  return CollecteSchema.safeParse(data);
}
