export type SourceType = "web" | "api" | "reseau";

export type SourceStatus = "validee" | "en_attente" | "erreur";

export interface Source {
  id: string;
  nom: string;
  url: string;
  type: SourceType;
  statut: SourceStatus;
  derniere_collecte: string | null;
  domaines: string[];
}

export interface SourceFilters {
  search: string;
  type: SourceType | "all";
  statut: SourceStatus | "all";
}

export const SOURCE_TYPE_LABEL: Record<SourceType, string> = {
  web: "Web",
  api: "API",
  reseau: "Réseau",
};

export const SOURCE_STATUS_LABEL: Record<SourceStatus, string> = {
  validee: "Validée",
  en_attente: "En attente",
  erreur: "Erreur",
};
