export type CollecteStatus = "en_cours" | "terminee" | "echouee" | "annulee";

export type CollecteType = "Web" | "Réseau" | "API";

export interface Collecte {
  id: string;
  source: string;
  type: CollecteType;
  statut: CollecteStatus;
  progression: number;
  pages: { collecte: number; total: number };
  duree: string;
  demarre: string;
}

export interface CollecteFormValues {
  source: string;
  type: CollecteType;
  statut: CollecteStatus;
  progression: number;
  pages_collecte: number;
  pages_total: number;
  duree: string;
}

export interface CollecteFilters {
  search?: string;
  statut?: CollecteStatus;
  type?: CollecteType;
}
