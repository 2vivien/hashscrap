export type CollecteStatus = "en_cours" | "terminee" | "echouee" | "annulee";

export type CollecteType = "web" | "api" | "reseau";

export interface Collecte {
  id: string;
  source: string;
  type: CollecteType;
  status: CollecteStatus;
  progress: number;
  pages: number;
  duration: string;
  started_at: string;
}

export interface CollecteFilters {
  search: string;
  status: CollecteStatus | "all";
  type: CollecteType | "all";
}

export const COLLECTE_STATUS_LABEL: Record<CollecteStatus, string> = {
  en_cours: "En cours",
  terminee: "Terminée",
  echouee: "Echouée",
  annulee: "Annulée",
};

export const COLLECTE_TYPE_LABEL: Record<CollecteType, string> = {
  web: "Web",
  api: "API",
  reseau: "Réseau",
};
