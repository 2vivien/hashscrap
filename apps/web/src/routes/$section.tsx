import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { InlineAlert } from "../components/InlineAlert";
import { StatusBadge } from "../components/StatusBadge";
import { getSectionConfig, isKnownSection } from "../lib/sections";

/** Runs on the server only: the API client never reaches the browser bundle. */
const getSources = createServerFn({ method: "GET" })
  .validator((section: string) => section)
  .handler(async ({ data: section }) => {
    if (section !== "sources") return null;
    const api = await import("../lib/api.server");
    return api.fetchSources();
  });

export const Route = createFileRoute("/$section")({
  component: SectionPage,
  loader: ({ params }) => getSources({ data: params.section }),
  head: ({ params }) => ({
    meta: [{ title: `${getSectionConfig(params.section).title} — HashScrap` }],
  }),
});

const ACTION_BY_SECTION: Record<string, { label: string; reason: string } | undefined> = {
  sources: {
    label: "＋ Ajouter une source",
    reason: "Disponible quand le contrat de création de source sera défini",
  },
  collectes: {
    label: "＋ Lancer une collecte",
    reason: "Disponible quand le contrat de lancement de collecte sera défini",
  },
};

function SectionPage() {
  const { section } = Route.useParams();
  const loaderData = Route.useLoaderData();
  const config = getSectionConfig(section);
  const action = ACTION_BY_SECTION[section];
  const known = isKnownSection(section);
  const sources = section === "sources" ? loaderData : null;
  const sourceList = sources?.data ?? null;

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

      {section === "sources" && sources ? (
        sources.problem ? (
          <ErrorState
            title="Le registre des sources est injoignable"
            description={`${sources.problem.message} Aucune source n’est affichée plutôt qu’un inventaire inventé.`}
            actions={
              <Link className="button button--secondary" to="/">
                Retour à la vue d’ensemble
              </Link>
            }
          />
        ) : sourceList !== null && sourceList.length > 0 ? (
          <section className="panel" aria-label="Sources enregistrées">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Identifiant</th>
                  <th scope="col">URL de base</th>
                  <th scope="col">Hôtes autorisés</th>
                  <th scope="col">État</th>
                </tr>
              </thead>
              <tbody>
                {sourceList.map((source) => (
                  <tr key={source.id}>
                    <td>{source.source_key}</td>
                    <td className="cell-url">{source.base_url ?? "—"}</td>
                    <td>{source.allowed_hosts.join(", ") || "—"}</td>
                    <td>
                      <StatusBadge
                        label={source.enabled ? "Active" : "Désactivée"}
                        tone={source.enabled ? "success" : "neutral"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : (
          <EmptyState
            compact
            symbol="⌁"
            title="Aucune source enregistrée"
            description="Les sources apparaissent ici dès qu’une collecte les a enregistrées via « hashscrap run »."
          />
        )
      ) : (
        <>
          <InlineAlert tone="warning" title="Fonction non connectée">
            {config.detail}
          </InlineAlert>
          <EmptyState
            compact
            symbol={section === "collectes" ? "↻" : "◇"}
            title="Aucune donnée chargée"
            description="Cette vue ne présente aucune donnée d’exemple comme si elle venait du serveur. Le contrat d’API correspondant reste à définir."
          />
        </>
      )}
    </>
  );
}