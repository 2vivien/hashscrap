import { z } from "zod";

export const InvestigationStatusSchema = z.enum(["en_cours", "terminee", "en_attente"]);

export const InvestigationSchema = z.object({
  id: z.string().min(1),
  nom: z.string().min(1),
  description: z.string().min(1),
  statut: InvestigationStatusSchema,
  sources: z.number().int().min(0),
  observations: z.number().int().min(0),
  derniere_activite: z.string().min(1),
});

export const InvestigationsResponseSchema = z.object({
  items: z.array(InvestigationSchema),
  total: z.number().int().min(0),
});

export type InvestigationPayload = z.infer<typeof InvestigationSchema>;
export type InvestigationsResponse = z.infer<typeof InvestigationsResponseSchema>;