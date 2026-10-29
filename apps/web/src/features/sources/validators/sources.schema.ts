import { z } from "zod";
export const SourceTypeSchema = z.enum(["web", "api", "reseau"]);
export const SourceStatusSchema = z.enum(["validee", "en_attente", "erreur"]);
export const SourceSchema = z.object({
  id: z.string(), nom: z.string(), url: z.string(), type: SourceTypeSchema,
  statut: SourceStatusSchema, derniere_collecte: z.string().datetime({ offset: true }).nullable(), domaines: z.array(z.string()),
}).strict();
export const SourcesResponseSchema = z.object({ items: z.array(SourceSchema), total: z.number().int().min(0) }).strict();
export type SourcePayload = z.infer<typeof SourceSchema>;
export type SourcesResponse = z.infer<typeof SourcesResponseSchema>;
