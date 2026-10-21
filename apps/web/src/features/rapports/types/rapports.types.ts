export type RapportStatus = "brouillon" | "validé" | "exporté";

export interface Rapport {
  id: string;
  titre: string;
  investigation: string;
  statut: RapportStatus;
  généré_le: string;
  format: "markdown" | "json";
  contenu_md: string;
  contenu_json: string;
}

export interface RapportFilters {
  statut?: RapportStatus;
  investigation?: string;
}