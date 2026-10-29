import { z } from "zod";
export const PreuveStatusSchema = z.enum(["validee", "en_attente", "erreur"]);
export const PreuveSchema = z.object({
  id: z.string(), url: z.string(), source: z.string(), collectee_le: z.string().datetime({ offset: true }),
  sha256: z.string(), statut: PreuveStatusSchema, taille: z.number().int().min(0), apercu_url: z.string(),
}).strict();
export const PreuvesResponseSchema = z.object({ items: z.array(PreuveSchema), total: z.number().int().min(0) }).strict();
export type PreuvePayload = z.infer<typeof PreuveSchema>;
export type PreuvesResponse = z.infer<typeof PreuvesResponseSchema>;
