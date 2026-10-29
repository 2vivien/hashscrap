import { z } from "zod";
import { CollecteSchema } from "../../collectes/validators/collectes.schema";

export const DashboardStatSchema = z.object({
  value: z.number().int().min(0),
  delta: z.string(),
});

export const DashboardStatsSchema = z.object({
  sources: DashboardStatSchema,
  collectes: DashboardStatSchema,
  observations: DashboardStatSchema,
  entites: DashboardStatSchema,
});

export const ActivitySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["collecte", "observation", "source", "rapport", "erreur"]),
  titre: z.string().min(1),
  detail: z.string(),
  at: z.string().min(1),
});

export const DashboardSchema = z.object({
  stats: DashboardStatsSchema,
  collectes: z.array(CollecteSchema),
  activite: z.array(ActivitySchema),
  points_attention: z.array(z.string()),
});

export type DashboardPayload = z.infer<typeof DashboardSchema>;
