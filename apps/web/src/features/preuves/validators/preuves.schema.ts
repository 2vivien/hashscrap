import { z } from "zod";

export const PreuveStatusSchema = z.enum(["validee", "en_attente", "erreur"]);

export const PreuveSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  source: z.string().min(1),
  collectee_le: z.string().min(1),
  sha256: z.string(),
  statut: PreuveStatusSchema,
  taille: z.number().int().min(0),
  apercu_url: z.string().min(1),
});

export const PreuvesResponseSchema = z.object({
  items: z.array(PreuveSchema),
  total: z.number().int().min(0),
});

export type PreuvePayload = z.infer<typeof PreuveSchema>;
export type PreuvesResponse = z.infer<typeof PreuvesResponseSchema>;
