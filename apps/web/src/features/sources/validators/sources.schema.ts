import { z } from "zod";

export const SourceTypeSchema = z.enum(["web", "api", "reseau"]);
export const SourceStatusSchema = z.enum(["validee", "en_attente", "erreur"]);

export const SourceSchema = z.object({
  id: z.string().min(1),
  nom: z.string().min(1),
  url: z.string().min(1),
  type: SourceTypeSchema,
  statut: SourceStatusSchema,
  derniere_collecte: z.string().nullable(),
  domaines: z.array(z.string()),
});

export const SourcesResponseSchema = z.object({
  items: z.array(SourceSchema),
  total: z.number().int().min(0),
});

export type SourcePayload = z.infer<typeof SourceSchema>;
export type SourcesResponse = z.infer<typeof SourcesResponseSchema>;
