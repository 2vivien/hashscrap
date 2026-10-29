import { z } from "zod";

export const EntityTypeSchema = z.enum(["email", "domaine", "ip", "personne", "telephone", "hash"]);
export const ConfianceLevelSchema = z.enum(["elevee", "moyenne", "faible"]);
export const ValidationStatusSchema = z.enum(["validee", "en_attente", "erreur"]);

export const ObservationSchema = z.object({
  id: z.string().min(1),
  champ: z.string().min(1),
  valeur_brute: z.string().min(1),
  valeur_normalisee: z.string().min(1),
  extracteur: z.string().min(1),
  version_extracteur: z.string().min(1),
  evidence_ref: z.string().min(1),
  validation_status: ValidationStatusSchema,
});

export const RelationSchema = z.object({
  id: z.string().min(1),
  cible: z.string().min(1),
  type: z.string().min(1),
  libelle: z.string().min(1),
});

export const EntityDetailResponseSchema = z.object({
  id: z.string().min(1),
  valeur: z.string().min(1),
  type: EntityTypeSchema,
  observations: z.number().int().min(0),
  confiance: ConfianceLevelSchema,
  derniere_detection: z.string().min(1),
  observations_liste: z.array(ObservationSchema),
  relations: z.array(RelationSchema),
  sources: z.array(z.string().min(1)),
});

export type ObservationPayload = z.infer<typeof ObservationSchema>;
export type RelationPayload = z.infer<typeof RelationSchema>;
export type EntityDetailResponse = z.infer<typeof EntityDetailResponseSchema>;

