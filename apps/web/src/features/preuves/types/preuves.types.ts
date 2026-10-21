export type PreuveStatus = "validée" | "en_attente" | "erreur";

export interface Preuve {
  id: string;
  aperçu_url: string;
  source: string;
  collectée_le: string;
  sha256: string;
  source_details: string;
  statut: PreuveStatus;
  taille: string;
}

export interface PreuveFilters {
  statut?: PreuveStatus;
  source?: string;
}
