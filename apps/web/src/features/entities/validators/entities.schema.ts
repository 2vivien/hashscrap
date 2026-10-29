import { z } from "zod";

export const EntityTypeSchema = z.enum(["email", "domaine", "ip", "personne", "telephone", "hash"]);
export const ConfianceLevelSchema = z.enum(["elevee", "moyenne", "faible"]);

export const EntitySchema = z.object({
  id: z.string().min(1),
  valeur: z.string().min(1),
  type: EntityTypeSchema,
  observations: z.number().int().min(0),
  confiance: ConfianceLevelSchema,
  derniere_detection: z.string().min(1),
});

export const EntitiesResponseSchema = z.object({
  items: z.array(EntitySchema),
  total: z.number().int().min(0),
});

export type EntityPayload = z.infer<typeof EntitySchema>;
export type EntitiesResponse = z.infer<typeof EntitiesResponseSchema>;

