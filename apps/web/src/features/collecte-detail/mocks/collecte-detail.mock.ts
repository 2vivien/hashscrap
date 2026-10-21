import type { CollecteDetail } from "../types/collecte-detail.types";

export const MOCK_COLLECTE_DETAIL: CollecteDetail = {
  id: "c-2025-0423-001",
  source: "HashCode Blog",
  type: "Web",
  statut: "en_cours",
  progression: 35,
  pages: { collecte: 1248, total: 3500 },
  duree: "1h12m",
  demarre: "2025-04-15T10:00:00Z",
  observations: { total: 4892, validated: 4200, rejected: 692 },
  erreurs: [
    { code: "T-001", message: "Timeout après 30 s", type: "Timeout", compteur: 1 },
    {
      code: "403-002",
      message: "Accès refusé au fichier robots.txt",
      type: "403",
      compteur: 1,
    },
    { code: "P-003", message: "Erreur de parsing HTML", type: "Parsing", compteur: 2 },
  ],
};
