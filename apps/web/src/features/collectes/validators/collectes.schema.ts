import { z } from "zod";
export const CollecteStatusSchema = z.enum(["en_cours", "terminee", "echouee", "annulee", "en_attente"]);
export const CollecteTypeSchema = z.enum(["web", "api", "reseau"]);
export const CollecteLaunchSchema = z.object({
  source: z.string().min(1), url: z.string().min(1).max(4096),
}).strict();
export const CollecteSchema = z.object({
  id: z.string(), source: z.string(), type: CollecteTypeSchema, status: CollecteStatusSchema,
  progress: z.number().int().min(0).max(100), pages: z.number().int().min(0), duration: z.string(),
  started_at: z.string().datetime({ offset: true }),
}).strict();
export const CollectesResponseSchema = z.object({ items: z.array(CollecteSchema), total: z.number().int().min(0) }).strict();
export type CollectePayload = z.infer<typeof CollecteSchema>;
export type CollectesResponse = z.infer<typeof CollectesResponseSchema>;
