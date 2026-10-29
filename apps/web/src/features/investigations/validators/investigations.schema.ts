import { z } from "zod";
export const InvestigationStatusSchema = z.enum(["en_cours", "terminee", "en_attente", "annulee"]);
export const InvestigationCreateSchema = z.object({
  nom: z.string().min(1).max(160), description: z.string().default(""),
}).strict();
export const InvestigationSchema = z.object({
  id: z.string(), nom: z.string(), description: z.string(), statut: InvestigationStatusSchema,
  sources: z.number().int().min(0), observations: z.number().int().min(0), derniere_activite: z.string().datetime({ offset: true }),
}).strict();
export const InvestigationsResponseSchema = z.object({ items: z.array(InvestigationSchema), total: z.number().int().min(0) }).strict();
export type InvestigationPayload = z.infer<typeof InvestigationSchema>;
export type InvestigationsResponse = z.infer<typeof InvestigationsResponseSchema>;
