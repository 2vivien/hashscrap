import { apiRequest } from "../../../lib/api-client";
import { isMockSource } from "../../../lib/data-source";
import { MOCK_COLLECTES } from "../../collectes/mocks/collectes.mock";
import { CollecteDetailSchema, type CollecteDetail } from "../validators/collecte-detail.schema";

/** Read the details of a specific collection job. */
export async function fetchCollecteDetail(id: string, signal?: AbortSignal): Promise<CollecteDetail> {
  if (isMockSource()) {
    const mockCollecte = MOCK_COLLECTES.items.find((c) => c.id === id);
    if (!mockCollecte) {
      throw new Error(`Collecte ${id} not found in mock data`);
    }
    return {
      ...mockCollecte,
      observations: {
        total: 4892,
        validated: 4200,
        rejected: 692,
      },
      erreurs: [
        {
          code: "TIMEOUT",
          message: "Timeout après 30 s",
          type: "Timeout",
          count: 4,
        },
        {
          code: "403",
          message: "Accès refusé au fichier robots.txt",
          type: "403",
          count: 1,
        },
        {
          code: "PARSING",
          message: "Erreur de parsing HTML",
          type: "Parsing",
          count: 2,
        },
        {
          code: "INVALID_URL",
          message: "Domaine non autorisé",
          type: "URL Invalide",
          count: 3,
        },
      ],
      evenements: [
        {
          at: "2025-05-12T14:23:00Z",
          label: "Collecte démarrée",
          detail: "",
        },
        {
          at: "2025-05-12T14:35:00Z",
          label: "Erreur timeout",
          detail: "",
        },
        {
          at: "2025-05-12T15:35:00Z",
          label: "Rapport généré",
          detail: "",
        },
      ],
    };
  }
  return apiRequest(`/collectes/${id}`, CollecteDetailSchema, { signal });
}