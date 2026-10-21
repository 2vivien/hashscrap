import type { Preuve } from "../types/preuves.types";

export const MOCK_PREUVES: Preuve[] = [
  {
    id: "pre-2025-04-001",
    aperçu_url: "https://example.com/preview",
    source: "HashCode Blog",
    collectée_le: "2025-04-15T10:00:00Z",
    sha256: "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90",
    source_details: "WebCrawler",
    statut: "validée",
    taille: "249 Ko",
  },
  {
    id: "pre-2025-04-002",
    aperçu_url: "https://news.example.com/preview",
    source: "Security News",
    collectée_le: "2025-04-10T14:30:00Z",
    sha256: "b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a",
    source_details: "API",
    statut: "en_attente",
    taille: "512 Ko",
  },
];
