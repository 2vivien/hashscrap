import { z } from 'zod';

const SourceSchema = z.object({
  id: z.string(),
  nom: z.string(),
  url: z.string(),
  type: z.enum(['web', 'api', 'reseau']),
  statut: z.enum(['validee', 'en_attente', 'erreur']),
  derniere_collecte: z.string(),
  domaines: z.array(z.string()),
});

export const SourcesResponseSchema = z.object({
  items: z.array(SourceSchema),
  total: z.number(),
});

export type SourcesResponse = z.infer<typeof SourcesResponseSchema>;
