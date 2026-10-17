import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { InlineAlert } from "../components/InlineAlert";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import {
  formatBytes,
  formatDateTime,
  runLabel,
  runTone,
  shortHash,
} from "../lib/api-format";

/** Runs on the server only: the API client never reaches the browser bundle. */
const getOverview = createServerFn({ method: "GET" }).handler(async () => {
  const api = await import("../lib/api.server");
  const [summary, runs, documents] = await Promise.all([
    api.fetchSummary(),
    api.fetchRuns(5),
    api.fetchDocuments(5),
  ]);
  return { summary, runs, documents };
});

export const Route = createFileRoute("/")({
  component: DashboardPage,
  loader: () => getOverview(),
  head: () => ({ meta: [{ title: "Vue d’ensemble — HashScrap" }] }),
});

function DashboardPage() {
  const { summary, runs, documents } = Route.useLoaderData();
  const stats = summary.data;
  const hasData = Boolean(stats && (stats.documents > 0 || stats.runs_total > 0));

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESPACE DE TRAVAIL / APERÇU</p>
          <h1>Vue d’ensemble</h1>
          <p className="page-description">
            Compteurs, dernières collectes et documents, lus depuis l’API du moteur.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          type="button"
          title="Disponible quand le contrat de création d’investigation sera défini"
        >
          <span aria-hidden="true">＋</span> Nouvelle investigation
        </button>
      </div>

      {summary.problem ? (
        <ErrorState
          title="Le service de données n’est pas joignable"
          description={`${summary.problem.message} Aucun compteur n’est affiché : une donnée absente n’est jamais remplacée par un zéro.`}
          actions={
            <Link className="button button--secondary" to="/$section" params={{ section: "sources" }}>
              Vérifier l’état des sources
            </Link>
          }
        />
      ) : stats && hasData ? (
        <>
          <section className="metric-grid" aria-label="Indicateurs de collecte">
            <MetricCard label="Documents collectés" value={String(stats.documents)} />
            <MetricCard label="Observations" value={String(stats.observations)} />
            <MetricCard
              label="Collectes réussies"
              value={`${stats.runs_succeeded}/${stats.runs_total}`}
              hint={`${stats.runs_failed} en échec`}
              tone="accent"
            />
            <MetricCard
              label="À vérifier"
              value={String(stats.observations_pending_review)}
              hint="observations non revues"
              tone={stats.observations_pending_review > 0 ? "warning" : "default"}
            />
          </section>

          <section className="panel" aria-labelledby="recent-runs">
            <header className="panel-header">
              <h2 id="recent-runs">Dernières collectes</h2>
              <Link className="panel-link" to="/$section" params={{ section: "collectes" }}>
                Voir les collectes
              </Link>
            </header>
            {runs.data && runs.data.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">État</th>
                    <th scope="col">Source</th>
                    <th scope="col">Début (UTC)</th>
                    <th scope="col">Réponses</th>
                    <th scope="col">Échecs</th>
                    <th scope="col">Octets</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.data.map((run) => (
                    <tr key={run.id}>
                      <td>
                        <StatusBadge label={runLabel(run.status)} tone={runTone(run.status)} />
                      </td>
                      <td>{run.source_key ?? "—"}</td>
                      <td>{formatDateTime(run.started_at)}</td>
                      <td>{run.fetched_count}</td>
                      <td>{run.failed_count}</td>
                      <td>{formatBytes(run.bytes_received)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                compact
                title="Aucune collecte enregistrée"
                description="Lancez « hashscrap run » : la collecte apparaîtra ici avec son état réel."
              />
            )}
          </section>

          <section className="panel" aria-labelledby="recent-documents">
            <header className="panel-header">
              <h2 id="recent-documents">Derniers documents</h2>
              <Link className="panel-link" to="/$section" params={{ section: "preuves" }}>
                Voir les preuves
              </Link>
            </header>
            {documents.data && documents.data.items.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">URL d’origine</th>
                    <th scope="col">Type</th>
                    <th scope="col">Statut</th>
                    <th scope="col">Empreinte</th>
                    <th scope="col">Observations</th>
                    <th scope="col">Vu (UTC)</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.data.items.map((document) => (
                    <tr key={document.id}>
                      <td className="cell-url">{document.original_url}</td>
                      <td>{document.media_type ?? "—"}</td>
                      <td>{document.status_code ?? "—"}</td>
                      <td className="cell-mono">{shortHash(document.content_sha256)}</td>
                      <td>{document.observations_count}</td>
                      <td>{formatDateTime(document.last_seen_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState
                compact
                title="Aucun document persisté"
                description="Les documents apparaissent ici dès qu’une collecte a persisté des observations."
              />
            )}
          </section>
        </>
      ) : (
        <>
          <InlineAlert tone="info" title="Le moteur répond, mais aucune collecte n’est encore enregistrée.">
            Les compteurs sont à zéro : ce n’est pas une erreur d’affichage, et aucune donnée
            d’exemple ne remplace les résultats.
          </InlineAlert>
          <EmptyState
            eyebrow="PRÊT POUR L’INTÉGRATION"
            title="Les données apparaîtront ici"
            description="Lancez « hashscrap run --config … --source … » côté moteur : ce tableau lira les documents et observations persistés."
            actions={
              <Link className="button button--secondary" to="/$section" params={{ section: "sources" }}>
                Voir les sources enregistrées
              </Link>
            }
          />
        </>
      )}
    </>
  );
}