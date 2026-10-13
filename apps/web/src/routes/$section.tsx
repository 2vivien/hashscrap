import { Link, createFileRoute } from "@tanstack/react-router";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { InlineAlert } from "../components/InlineAlert";
import { getSectionConfig, isKnownSection } from "../lib/sections";

export const Route = createFileRoute("/$section")({
  component: SectionPage,
  head: ({ params }) => ({ meta: [{ title: `${getSectionConfig(params.section).title} — HashScrap` }] }),
});

const ACTION_BY_SECTION: Record<string, { label: string; reason: string } | undefined> = {
  sources: { label: "＋ Ajouter une source", reason: "Disponible quand l’API de création de source existera" },
  collectes: { label: "＋ Lancer une collecte", reason: "Disponible quand l’API de lancement de collecte existera" },
};

function SectionPage() {
  const { section } = Route.useParams();
  const config = getSectionConfig(section);
  const action = ACTION_BY_SECTION[section];
  const known = isKnownSection(section);

  if (!known) {
    return (
      <>
        <div className="page-heading">
          <div>
            <p className="eyebrow">ESPACE DE TRAVAIL</p>
            <h1>{config.title}</h1>
            <p className="page-description">{config.description}</p>
          </div>
        </div>
        <ErrorState
          title="Cette adresse ne correspond à aucune section"
          description={config.detail}
          actions={
            <Link className="button button--secondary" to="/">
              Retour à la vue d’ensemble
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h1>{config.title}</h1>
          <p className="page-description">{config.description}</p>
        </div>
        {action ? (
          <button className="button button--primary" disabled type="button" title={action.reason}>
            {action.label}
          </button>
        ) : null}
      </div>
      <InlineAlert tone="warning" title="Fonction non connectée">
        {config.detail}
      </InlineAlert>
      <EmptyState
        compact
        symbol={section === "sources" ? "⌁" : section === "collectes" ? "↻" : "◇"}
        title="Aucune donnée chargée"
        description="Cette vue ne présente aucune donnée d’exemple comme si elle venait du serveur. Connectez un contrat d’API validé pour l’activer."
      />
    </>
  );
}