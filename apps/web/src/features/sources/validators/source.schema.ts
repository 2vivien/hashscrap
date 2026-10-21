import { z } from "zod";
import type { Source } from "../types/source.types";

export const SourceTypeSchema = z.enum(["website", "api", "network"]);

export const SourceLimitsSchema = z.object({
  timeout_seconds: z.number().int().min(1).max(120),
  concurrency: z.number().int().min(1).max(16),
  requests_per_second: z.number().min(0.1).max(5),
  max_depth: z.number().int().min(0).max(10),
  max_pages: z.number().int().min(1).max(10_000),
  max_response_bytes: z.number().int().min(1).max(10_000_000),
});

export const SourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(120),
  type: SourceTypeSchema,
  base_url: z.url(),
  enabled: z.boolean(),
  allowed_hosts: z.array(z.string().min(1)).min(1).max(100),
  limits: SourceLimitsSchema,
  created_at: z.string().optional(),
});

export const SourceFormSchema = SourceSchema.omit({ id: true, created_at: true });

export type SourcePayload = z.infer<typeof SourceSchema>;
export type SourceFormPayload = z.infer<typeof SourceFormSchema>;

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
  ? true
  : false;
type Assert<T extends true> = T;

/** Compile-time guard: the Zod contract must stay aligned with the shared type. */
export type SourceSchemaMatchesType = Assert<Equals<SourcePayload, Source>>;

export function validateSource(data: unknown): z.ZodSafeParseResult<SourcePayload> {
  return SourceSchema.safeParse(data);
}
