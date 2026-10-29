import { z } from "zod";
export const EntityTypeSchema = z.enum(["email", "domaine", "ip", "personne", "telephone", "hash"]);
export const ConfianceLevelSchema = z.enum(["elevee", "moyenne", "faible"]);
export const EntitySchema = z.object({
  id: z.string(), valeur: z.string(), type: EntityTypeSchema, observations: z.number().int().min(0),
  confiance: ConfianceLevelSchema, derniere_detection: z.string().datetime({ offset: true }),
}).strict();
export const EntitiesResponseSchema = z.object({ items: z.array(EntitySchema), total: z.number().int().min(0) }).strict();
export type EntityPayload = z.infer<typeof EntitySchema>;
export type EntitiesResponse = z.infer<typeof EntitiesResponseSchema>;
