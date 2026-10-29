import { z } from "zod";

export const CollectorSettingsSchema = z.object({
  requests_per_second: z.number(), depth: z.number().int(), max_pages: z.number().int(), timeout: z.number().int(),
}).strict();
export const NetworkSettingsSchema = z.object({
  proxy: z.string(), user_agent_rotation: z.boolean(), robots_txt: z.boolean(),
}).strict();
export const RetentionSettingsSchema = z.object({
  preuves: z.enum(["90", "365", "illimite"]),
  auto_suppression_logs: z.object({ active: z.boolean(), jours: z.number().int().min(0).max(365) }).strict(),
}).strict();
export const SecuritySettingsSchema = z.object({ reset_warning: z.boolean() }).strict();
export const AuditSettingsSchema = z.object({
  logs: z.array(z.object({
    at: z.string(), level: z.enum(["INFO", "DEBUG", "WARN", "ERROR"]), message: z.string(),
  }).strict()),
  derniere_maj: z.string(), version: z.string(), licence: z.string(),
}).strict();
export const ParametresSchema = z.object({
  collecteur: CollectorSettingsSchema, reseau: NetworkSettingsSchema, conservation: RetentionSettingsSchema,
  securite: SecuritySettingsSchema, audit: AuditSettingsSchema,
}).strict();
export const ParametresUpdateSchema = z.object({
  collecteur: CollectorSettingsSchema.nullish(), reseau: NetworkSettingsSchema.nullish(),
  conservation: RetentionSettingsSchema.nullish(), securite: SecuritySettingsSchema.nullish(),
}).strict().refine((value) => Object.values(value).some((entry) => entry != null), "Au moins une section doit être fournie");
export type ParametresPayload = z.infer<typeof ParametresSchema>;
export type ParametresUpdatePayload = z.infer<typeof ParametresUpdateSchema>;
