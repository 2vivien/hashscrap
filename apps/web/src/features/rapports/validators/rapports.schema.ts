import { z } from "zod";
export const RapportStatusSchema = z.enum(["validee", "en_attente"]);
export const RapportFormatSchema = z.enum(["pdf", "markdown", "json"]);
export const RapportGenerateSchema = z.object({
  titre: z.string().min(1).max(200), investigation: z.string().default(""),
}).strict();
export const RapportSchema = z.object({
  id: z.string(), titre: z.string(), investigation: z.string(), statut: RapportStatusSchema,
  genere_le: z.string().datetime({ offset: true }), format: RapportFormatSchema, contenu: z.string(),
}).strict();
export const RapportsResponseSchema = z.object({ items: z.array(RapportSchema), total: z.number().int().min(0) }).strict();
export type RapportPayload = z.infer<typeof RapportSchema>;
export type RapportsResponse = z.infer<typeof RapportsResponseSchema>;
