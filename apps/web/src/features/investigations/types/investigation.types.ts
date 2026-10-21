export type InvestigationStatus = "en_cours" | "en_pause" | "terminee";

export interface Investigation {
  id: string;
  name: string;
  description: string;
  statut: InvestigationStatus;
  sources: string[];
  observations: string[];
  derniere_activité: string;
}

export interface InvestigationFilters {
  statut?: InvestigationStatus;
  source?: string;
}