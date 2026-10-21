export type CollecteDetailTab = "résumé" | "événements" | "résultats" | "erreurs";

export interface ObservationsSummary {
  total: number;
  validated: number;
  rejected: number;
}

export interface CollecteDetail {
  id: string;
  source: string;
  type: "Web" | "Réseau" | "API";
  statut: "en_cours" | "terminee" | "echouee" | "annulee";
  progression: number;
  pages: { collecte: number; total: number };
  duree: string;
  demarre: string;
  observations: ObservationsSummary;
  erreurs: Array<{
    code: string;
    message: string;
    type: "Timeout" | "403" | "Parsing" | "URL Invalide";
    compteur: number;
  }>;
}

export interface CollecteDetailFormValues {
  id: string;
  relancer: boolean;
}