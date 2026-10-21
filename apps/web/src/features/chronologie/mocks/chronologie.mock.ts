import type { EvenementTimeline } from "../types/chronologie.types";

export const MOCK_CHRONOLOGIE: EvenementTimeline[] = [
  {
    date: "15/04/2025",
    type: "collecte",
    icone: "↻",
    titre: "Collecte HashCode Blog",
    description: "Collecte démarrée pour le blog HashCode",
  },
  {
    date: "16/04/2025",
    type: "observation",
    icone: "●",
    titre: "Nouvelle observation détectée",
    description: "Email détecté : john.doe@company.com",
  },
  {
    date: "17/04/2025",
    type: "événement",
    icone: "◐",
    titre: "Erreur de collecte",
    description: "Timeout sur l’URL https://example.com",
  },
  {
    date: "18/04/2025",
    type: "preuve",
    icone: "▤",
    titre: "Preuve téléchargée",
    description: "Document extrait et empreinte SHA-256 calculée",
  },
  {
    date: "19/04/2025",
    type: "relation",
    icone: "◇",
    titre: "Relation établie",
    description: "Lien entre example.com et company.com",
  },
];
