export type EntityDetailTab = "aperçu" | "observations" | "sources" | "relations" | "historique";

export interface Entity {
  id: string;
  entity_type: "organization" | "domain" | "ip" | "url";
  raw_identifier: string;
  normalized_identifier: string;
  normalization_method: string;
  review_status: "unreviewed" | "accepted_exact" | "needs_review" | "rejected";
  created_at: string;
}

export interface EntityObservation {
  id: string;
  champ: string;
  valeur_brute: string;
  valeur_normalisee: string;
  extracteur: string;
  version_extracteur: string;
  evidence_ref: string;
  validation_status: "unreviewed" | "validated" | "rejected";
}

export interface EntityRelation {
  id: string;
  source: string;
  target: string;
  type: string;
  review_status: "unreviewed" | "accepted_exact" | "needs_review" | "rejected";
}