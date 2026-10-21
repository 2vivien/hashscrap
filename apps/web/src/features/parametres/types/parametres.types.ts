export type ParametresSection = "collecteur" | "reseau" | "conservation" | "securite" | "audit";

export interface CollecteurLimits {
  pages_max: number;
  profondeur: number;
  timeout: number;
  concurrence: number;
}

export interface ReseauLimits {
  perimeter: "internet" | "restreint";
  restrictions: string[];
}

export interface ConservationLimits {
  retention_obs: number; // en jours
  retention_preuves: number;
  retention_rapports: number;
}

export interface SecuriteLimits {
  audit_log: boolean;
  requires_auth: boolean;
}

export interface ParametresFormValues {
  collecteur: CollecteurLimits;
  reseau: ReseauLimits;
  conservation: ConservationLimits;
  securite: SecuriteLimits;
}