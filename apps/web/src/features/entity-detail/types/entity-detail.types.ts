export type EntityType = "email" | "domaine" | "ip" | "personne" | "telephone" | "hash";

export type ConfianceLevel = "elevee" | "moyenne" | "faible";

export const CONFIANCE_LEVEL_LABEL: Record<ConfianceLevel, string> = {
  elevee: "Élevée",
  moyenne: "Moyenne",
  faible: "Faible",
};

export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  email: "Email",
  domaine: "Domaine",
  ip: "IP",
  personne: "Personne",
  telephone: "Téléphone",
  hash: "Hash",
};
