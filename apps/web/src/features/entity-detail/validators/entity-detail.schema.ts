import { z } from "zod";
export const EntityTypeSchema = z.enum(["email", "domaine", "ip", "personne", "telephone", "hash"]);
export const ConfianceLevelSchema = z.enum(["elevee", "moyenne", "faible"]);
export const ValidationStatusSchema = z.enum(["unreviewed", "validated", "rejected"]);
export const ObservationSchema = z.object({
  id: z.string(), champ: z.string(), valeur_brute: z.string(), valeur_normalisee: z.string(),
  extracteur: z.string(), version_extracteur: z.string(), evidence_ref: z.string(), validation_status: ValidationStatusSchema,
}).strict();
export const RelationSchema = z.object({ id: z.string(), cible: z.string(), type: z.string(), libelle: z.string() }).strict();
export const EntityDetailResponseSchema = z.object({
  id: z.string(), valeur: z.string(), type: EntityTypeSchema, observations: z.number().int().min(0),
  confiance: ConfianceLevelSchema, derniere_detection: z.string().datetime({ offset: true }),
  observations_liste: z.array(ObservationSchema), relations: z.array(RelationSchema), sources: z.array(z.string()),
}).strict();
export type ObservationPayload = z.infer<typeof ObservationSchema>;
export type RelationPayload = z.infer<typeof RelationSchema>;
export type EntityDetailResponse = z.infer<typeof EntityDetailResponseSchema>;
