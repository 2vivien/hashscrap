import type { Investigation } from "../types/investigation.types";

export const MOCK_INVESTIGATIONS: Investigation[] = [
  {
    id: "inv-2025-04-001",
    name: "Enquête HashCode",
    description: "Enquête sur les activités suspectes",
    statut: "en_cours",
    sources: ["s-2025-04-001", "s-2025-04-002"],
    observations: ["obs-001", "obs-002", "obs-003"],
    derniere_activité: "2025-04-15T14:30:00Z",
  },
  {
    id: "inv-2025-04-002",
    name: "Enquête Sécurité Réseau",
    description: "Enquête sur les incidents réseau",
    statut: "terminee",
    sources: ["s-2025-04-003"],
    observations: ["obs-004"],
    derniere_activité: "2025-04-10T09:15:00Z",
  },
];
