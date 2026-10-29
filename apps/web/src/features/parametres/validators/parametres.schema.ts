import { z } from "zod";

export const ParametresSchema = z.object({
  collecteur: z.object({
    requests_per_second: z.number().min(0).max(10),
    depth: z.number().int().min(0).max(10),
    max_pages: z.number().int().min(0).max(10000),
    timeout: z.number().int().min(0).max(60),
  }),
  reseau: z.object({
    proxy: z.string().min(1),
    user_agent_rotation: z.boolean(),
    robots_txt: z.boolean(),
  }),
  conservation: z.object({
    preuves: z.enum(["90", "365", "illimite"]),
    auto_suppression_logs: z.object({
      active: z.boolean(),
      jours: z.number().int().min(0).max(365),
    }),
  }),
  securite: z.object({
    reset_warning: z.boolean(),
  }),
  audit: z.object({
    logs: z.array(
      z.object({
        at: z.string().min(1),
        level: z.enum(["INFO", "DEBUG", "WARN", "ERROR"]),
        message: z.string().min(1),
      }),
    ),
    derniere_maj: z.string().min(1),
    version: z.string().min(1),
    licence: z.string().min(1),
  }),
});

export type ParametresPayload = z.infer<typeof ParametresSchema>;
