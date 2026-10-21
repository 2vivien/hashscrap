import type { Rapport } from "../types/rapports.types";

export const MOCK_RAPPORTS: Rapport[] = [
  {
    id: "r-2025-04-001",
    titre: "Rapport d’enquête HashCode - Q2 2025",
    investigation: "inv-2025-04-001",
    statut: "validé",
    généré_le: "2025-04-15T16:00:00Z",
    format: "markdown",
    contenu_md:
      "# HashScrap - Rapport Investigation\n\n## Résumé exécutif\n\nContenu de démonstration.",
    contenu_json: "{ \"schema_version\": \"1.0\", \"investigation_id\": \"inv-2025-04-001\" }",
  },
];
