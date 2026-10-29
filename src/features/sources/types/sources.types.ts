export interface Source {
  id: string;
  nom: string;
  url: string;
  type: 'web' | 'api' | 'reseau';
  statut: 'validee' | 'en_attente' | 'erreur';
  derniere_collecte: string;
  domaines: string[];
}

export interface SourcesResponse {
  items: Source[];
  total: number;
}

// Tableaux de correspondance pour les libellés

export const TYPE_LABELS: Record<Source['type'], string> = {
  web: 'Web',
  api: 'API',
  reseau: 'Réseau',
};

export const STATUT_LABELS: Record<Source['statut'], string> = {
  validee: 'Validée',
  en_attente: 'En attente',
  erreur: 'Erreur',
};
