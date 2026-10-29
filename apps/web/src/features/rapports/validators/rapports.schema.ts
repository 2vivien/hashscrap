import { z } from "zod";

export const RapportStatusSchema = z.enum(["validee", "en_attente"]);
export const RapportFormatSchema = z.enum(["pdf", "markdown", "json"]);

export const RapportSchema = z.object({
  id: z.string().min(1),
  titre: z.string().min(1),
  investigation: z.string().min(1),
  statut: RapportStatusSchema,
  genere_le: z.string().min(1),
  format: RapportFormatSchema,
  contenu: z.string().min(1),
});

export const RapportsResponseSchema = z.object({
  items: z.array(RapportSchema),
  total: z.number().int().min(0),
});

export type RapportPayload = z.infer<typeof RapportSchema>;
export type RapportsResponse = z.infer<typeof RapportsResponseSchema>;
