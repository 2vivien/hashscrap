import { z } from 'zod';

const DashboardStatsSchema = z.object({
  sources: z.object({
    value: z.number(),
    delta: z.number(),
  }),
  collectes: z.object({
    value: z.number(),
    delta: z.number(),
  }),
  observations: z.object({
    value: z.number(),
    delta: z.number(),
  }),
  entites: z.object({
    value: z.number(),
    delta: z.number(),
  }),
});

const CollecteSchema = z.object({
  id: z.string(),
  source: z.string(),
  type: z.enum(['web', 'api', 'reseau']),
  statut: z.enum(['en_cours', 'terminee', 'echouee']),
  progression: z.number(),
  pages: z.number(),
  duree: z.string(),
  demarre: z.string(),
});

const ActiviteSchema = z.object({
  id: z.string(),
  type: z.string(),
  titre: z.string(),
  detail: z.string(),
  at: z.string(),
});

export const DashboardResponseSchema = z.object({
  stats: DashboardStatsSchema,
  collectes: z.array(CollecteSchema),
  activite: z.array(ActiviteSchema),
  points_attention: z.array(z.string()),
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
