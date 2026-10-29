export type EntityType = "email" | "domaine" | "ip" | "personne" | "telephone" | "hash";

export type ConfianceLevel = "elevee" | "moyenne" | "faible";

export interface Entity {
  id: string;
  valeur: string;
  type: EntityType;
  observations: number;
  confiance: ConfianceLevel;
  derniere_detection: string;
}

export interface EntityFilters {
  search: string;
  type: EntityType | "all";
  confiance: ConfianceLevel | "all";
}

export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  email: "Email",
  domaine: "Domaine",
  ip: "IP",
  personne: "Personne",
  telephone: "Téléphone",
  hash: "Hash",
};

export const CONFIANCE_LEVEL_LABEL: Record<ConfianceLevel, string> = {
  elevee: "Élevée",
  moyenne: "Moyenne",
  faible: "Faible",
};