import { z } from "zod";
import { CollecteSchema } from "../../collectes/validators/collectes.schema";
export const DashboardStatSchema = z.object({ value: z.number().int().min(0), delta: z.string() }).strict();
export const DashboardStatsSchema = z.object({
  sources: DashboardStatSchema, collectes: DashboardStatSchema, observations: DashboardStatSchema, entites: DashboardStatSchema,
}).strict();
export const ActivitySchema = z.object({
  id: z.string(), type: z.enum(["collecte", "observation", "source", "rapport", "erreur"]),
  titre: z.string(), detail: z.string(), at: z.string().datetime({ offset: true }),
}).strict();
export const DashboardSchema = z.object({
  stats: DashboardStatsSchema, collectes: z.array(CollecteSchema), activite: z.array(ActivitySchema), points_attention: z.array(z.string()),
}).strict();
export type DashboardPayload = z.infer<typeof DashboardSchema>;
