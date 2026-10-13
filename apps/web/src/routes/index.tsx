import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "../components/EmptyState";
import { InlineAlert } from "../components/InlineAlert";

export const Route = createFileRoute("/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Vue d’ensemble — HashScrap" }] }),
});

function DashboardPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESPACE DE TRAVAIL / APERÇU</p>
          <h1>Vue d’ensemble</h1>
          <p className="page-description">
            Suivez les collectes, vérifiez les preuves et identifiez la prochaine action utile.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          type="button"
          title="Disponible quand l’API de création d’investigation sera implémentée"
        >
          <span aria-hidden="true">＋</span> Nouvelle investigation
        </button>
      </div>
      <InlineAlert tone="info" title="Le moteur n’est pas encore connecté à cette interface.">
        Aucune statistique n’est affichée tant que les contrats d’API n’existent pas. Les états vide,
        partiel, erreur et succès seront rendus à partir de réponses réelles.
      </InlineAlert>
      <EmptyState
        compact
        eyebrow="PRÊT POUR L’INTÉGRATION"
        title="Les données apparaîtront ici"
        description="Connectez les endpoints de sources et de collectes : les compteurs et statuts seront alors issus du moteur, jamais de données d’exemple."
        actions={
          <>
            <Link className="button button--secondary" to="/$section" params={{ section: "sources" }}>
              Voir les sources
            </Link>
            <Link className="button button--secondary" to="/$section" params={{ section: "collectes" }}>
              Voir les collectes
            </Link>
          </>
        }
      />
    </>
  );
}