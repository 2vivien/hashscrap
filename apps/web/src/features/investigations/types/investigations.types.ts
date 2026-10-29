export type InvestigationStatus = "en_cours" | "terminee" | "en_attente";

export interface Investigation {
  id: string;
  nom: string;
  description: string;
  statut: InvestigationStatus;
  sources: number;
  observations: number;
  derniere_activite: string;
}

export interface InvestigationFilters {
  search: string;
}

export const INVESTIGATION_STATUS_LABEL: Record<InvestigationStatus, string> = {
  en_cours: "En cours",
  terminee: "Terminée",
  en_attente: "En attente",
};