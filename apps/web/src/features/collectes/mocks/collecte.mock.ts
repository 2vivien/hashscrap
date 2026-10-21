import type { Collecte } from "../types/collecte.types";

export const MOCK_COLLECTES: Collecte[] = [
  {
    id: "c-2025-0423-001",
    source: "HashCode Blog",
    type: "Web",
    statut: "en_cours",
    progression: 35,
    pages: { collecte: 1248, total: 3500 },
    duree: "1h12m",
    demarre: "2025-04-15T10:00:00Z",
  },
  {
    id: "c-2025-0423-002",
    source: "Security News",
    type: "API",
    statut: "terminee",
    progression: 100,
    pages: { collecte: 500, total: 500 },
    duree: "2h30m",
    demarre: "2025-04-10T14:30:00Z",
  },
  {
    id: "c-2025-0423-003",
    source: "Network Scan",
    type: "Réseau",
    statut: "echouee",
    progression: 60,
    pages: { collecte: 200, total: 500 },
    duree: "45m",
    demarre: "2025-04-12T09:15:00Z",
  },
];

export const MOCK_COLLECTE_FORM: Collecte = MOCK_COLLECTES[0];