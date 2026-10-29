export type RapportStatus = "validee" | "en_attente";
export type RapportFormat = "pdf" | "markdown" | "json";

export interface Rapport {
  id: string;
  titre: string;
  investigation: string;
  statut: RapportStatus;
  genere_le: string;
  format: RapportFormat;
  contenu: string;
}

export interface RapportsFilters {
  search: string;
  statut: RapportStatus | "all";
  format: RapportFormat | "all";
}

export const RAPPORT_STATUS_LABEL: Record<RapportStatus, string> = {
  validee: "Validée",
  en_attente: "En attente",
};

export const RAPPORT_FORMAT_LABEL: Record<RapportFormat, string> = {
  pdf: "PDF",
  markdown: "Markdown",
  json: "JSON",
};
