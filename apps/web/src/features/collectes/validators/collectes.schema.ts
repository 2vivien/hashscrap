import { z } from "zod";

export const CollecteStatusSchema = z.enum(["en_cours", "terminee", "echouee", "annulee"]);
export const CollecteTypeSchema = z.enum(["web", "api", "reseau"]);

export const CollecteSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  type: CollecteTypeSchema,
  status: CollecteStatusSchema,
  progress: z.number().min(0).max(100),
  pages: z.number().int().min(0),
  duration: z.string().min(1),
  started_at: z.string().min(1),
});

export const CollectesResponseSchema = z.object({
  items: z.array(CollecteSchema),
  total: z.number().int().min(0),
});

export type CollectePayload = z.infer<typeof CollecteSchema>;
export type CollectesResponse = z.infer<typeof CollectesResponseSchema>;
