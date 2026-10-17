import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  fetchRuns,
  isAbortError,
  RUN_STATUSES,
  type ApiRun,
} from "../lib/api";
import { describeRunStatus, statusTone } from "../lib/run-status";
import {
  formatBytes,
  formatDateTimeUtc,
  formatDuration,
  formatProcessing,
  shortId,
} from "../lib/run-format";
import { StatusBadge } from "./StatusBadge";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

/** Server-side bound on `GET /api/v1/runs` (1..100). We ask for the page size we render. */
const RUNS_LIMIT = 20;

type ViewState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; runs: ApiRun[] };

function ViewHeader() {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">EXÉCUTION / DIAGNOSTIC</p>
        <h1>Collectes</h1>
        <p className="page-description">
          Suivez l’état des tâches exécutées et repérez les échecs à partir des compteurs serveur.
        </p>
      </div>
      <button
        type="button"
        className="button button--primary"
        disabled
        title="Aucune API de lancement ou d’arrêt n’est exposée : le contrat est en lecture seule."
      >
        <span aria-hidden="true">＋</span> Lancer une collecte
      </button>
    </div>
  );
}

function SummaryBar({ runs }: { runs: ApiRun[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const run of runs) {
      map.set(run.status, (map.get(run.status) ?? 0) + 1);
    }
    const known = RUN_STATUSES.map((status) => ({
      status: status as string,
      count: map.get(status) ?? 0,
    }));
    const unknown = [...map.entries()].filter(
      ([status]) => !RUN_STATUSES.includes(status as (typeof RUN_STATUSES)[number]),
    );
    return { known, unknown };
  }, [runs]);

  return (
    <div className="summary-cards" aria-label="Répartition par état">
      {counts.known.map(({ status, count }) => {
        const meta = describeRunStatus(status);
        return (
          <div className="summary-card" key={status} title={meta.description}>
            <StatusBadge label={meta.label} tone={statusTone(status)} />
            <strong>{count}</strong>
          </div>
        );
      })}
      {counts.unknown.map(([status, count]) => (
        <div className="summary-card" key={status}>
          <StatusBadge label={describeRunStatus(status).label} tone={statusTone(status)} />
          <strong>{count}</strong>
        </div>
      ))}
    </div>
  );
}

function RunsTable({ runs }: { runs: ApiRun[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <caption className="visually-hidden">
          Collectes chargées depuis GET /api/v1/runs. Colonnes : identifiant, source, état,
          traitement, données reçues, début et durée.
        </caption>
        <thead>
          <tr>
            <th scope="col">IDENTIFIANT</th>
            <th scope="col">SOURCE</th>
            <th scope="col">ÉTAT</th>
            <th scope="col">TRAITEMENT</th>
            <th scope="col">REÇU</th>
            <th scope="col">DÉBUT (UTC)</th>
            <th scope="col">DURÉE</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td>
                <code className="mono" title={`Identifiant complet : ${run.id}`}>
                  {shortId(run.id)}
                </code>
              </td>
              <td>
                {run.source_key ? (
                  <span className="mono">{run.source_key}</span>
                ) : (
                  <span className="muted">Source non associée</span>
                )}
              </td>
              <td>
                <StatusBadge
                  label={describeRunStatus(run.status).label}
                  tone={statusTone(run.status)}
                />
              </td>
              <td>{formatProcessing(run.fetched_count, run.failed_count)}</td>
              <td>{formatBytes(run.bytes_received)}</td>
              <td>{formatDateTimeUtc(run.started_at)}</td>
              <td>{formatDuration(run.started_at, run.finished_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CollectesView() {
  const [state, setState] = useState<ViewState>({ kind: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const controller = new AbortController();
    setState({ kind: "loading" });
    fetchRuns(RUNS_LIMIT, controller.signal)
      .then((runs) => setState({ kind: "ready", runs }))
      .catch((error: unknown) => {
        if (isAbortError(error)) {
          return;
        }
        const message =
          error instanceof ApiError
            ? error.message
            : "Erreur inattendue pendant la lecture des collectes. Aucune donnée n’est affichée à la place.";
        setState({ kind: "error", message });
      });
    return () => controller.abort();
  }, [reloadKey]);

  const retry = useCallback(() => setReloadKey((key) => key + 1), []);

  const runs = state.kind === "ready" ? state.runs : [];
  const visibleRuns = useMemo(
    () => (statusFilter === "all" ? runs : runs.filter((run) => run.status === statusFilter)),
    [runs, statusFilter],
  );

  return (
    <>
      <ViewHeader />

      <section className="notice notice--info" role="status">
        <span className="notice-icon" aria-hidden="true">
          i
        </span>
        <div>
          <strong>Lecture seule · GET /api/v1/runs</strong>
          <p>
            Cette vue lit le contrat API existant. Aucune donnée d’exemple n’est affichée : si l’API
            est injoignable ou vide, l’état correspondant est montré à la place.
          </p>
        </div>
      </section>

      {state.kind === "loading" ? (
        <LoadingSkeleton label="Chargement des collectes" rows={5} />
      ) : null}

      {state.kind === "error" ? (
        <ErrorState
          title="Collectes indisponibles"
          description={state.message}
          actions={
            <button type="button" className="button button--secondary" onClick={retry}>
              Réessayer
            </button>
          }
        />
      ) : null}

      {state.kind === "ready" && runs.length === 0 ? (
        <EmptyState
          title="Aucune collecte enregistrée"
          description="Le service a répondu sans aucune collecte. Les tâches apparaîtront ici dès qu’une exécution sera persistée."
        />
      ) : null}

      {state.kind === "ready" && runs.length > 0 ? (
        <>
          <section className="runs-toolbar" aria-label="Filtres des collectes">
            <label className="field">
              <span className="field__label">Filtrer par état</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">Tous les états</option>
                {RUN_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {describeRunStatus(status).label}
                  </option>
                ))}
              </select>
            </label>
            <p className="toolbar-hint">
              Filtre appliqué aux {runs.length} collectes chargées (les plus récentes, limite API
              {" "}
              {RUNS_LIMIT}).
            </p>
          </section>

          <SummaryBar runs={runs} />

          {visibleRuns.length === 0 ? (
            <EmptyState
              title="Aucune collecte pour ce filtre"
              description="Les collectes chargées ne contiennent aucune exécution dans cet état. Élargissez le filtre pour voir les autres."
            />
          ) : (
            <RunsTable runs={visibleRuns} />
          )}
        </>
      ) : null}
    </>
  );
}
