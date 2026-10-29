export interface DashboardStats {
  sources: {
    value: number;
    delta: number;
  };
  collectes: {
    value: number;
    delta: number;
  };
  observations: {
    value: number;
    delta: number;
  };
  entites: {
    value: number;
    delta: number;
  };
}

export interface Collecte {
  id: string;
  source: string;
  type: 'web' | 'api' | 'reseau';
  statut: 'en_cours' | 'terminee' | 'echouee';
  progression: number;
  pages: number;
  duree: string;
  demarre: string;
}

export interface Activite {
  id: string;
  type: string;
  titre: string;
  detail: string;
  at: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  collectes: Collecte[];
  activite: Activite[];
  points_attention: string[];
}

// Tableaux de correspondance pour les libellés

export const TYPE_LABELS: Record<Collecte['type'], string> = {
  web: 'Web',
  api: 'API',
  reseau: 'Réseau',
};

export const STATUT_LABELS: Record<Collecte['statut'], string> = {
  en_cours: 'En cours',
  terminee: 'Terminée',
  echouee: 'Échouée',
};
