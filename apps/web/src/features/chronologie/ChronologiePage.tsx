import { useMemo, useState } from "react";
import { DemoBanner } from "../../components/ui/DemoBanner";
import { useChronologie } from "./api/chronologie.queries";
import type { ChronologieFilterOptions } from "./types/chronologie.types";

const EVENT_TYPES = ["tous_types", "collecte", "observation", "événement", "preuve", "relation"] as const;

export function ChronologiePage() {
  const { data: evenements = [], isLoading } = useChronologie();
  const [filters, setFilters] = useState<ChronologieFilterOptions>({
    date_debut: "01/04/2025",
    date_fin: "12/05/2025",
    type: "tous_types",
    source: "toutes_sources",
  });

  const visible = useMemo(
    () =>
      filters.type === "tous_types"
        ? evenements
        : evenements.filter((evenement) => evenement.type === filters.type),
    [evenements, filters.type],
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ANALYSE / ÉVÉNEMENTS</p>
          <h1>Chronologie</h1>
          <p className="page-description">
            Reconstituez la séquence des observations et des collectes.
          </p>
        </div>
      </div>

      <DemoBanner message="Les événements ci-dessous sont fictifs : la chronologie n’est pas encore alimentée par le moteur." />

      <div className="toolbar">
        <div className="field" style={{ minWidth: "180px" }}>
          <label className="field-label" htmlFor="chronologie-type">
            Type
          </label>
          <select
            id="chronologie-type"
            className="select"
            value={filters.type}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                type: event.currentTarget.value as ChronologieFilterOptions["type"],
              }))
            }
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "tous_types" ? "Tous types" : type}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ minWidth: "180px" }}>
          <label className="field-label" htmlFor="chronologie-source">
            Source
          </label>
          <select
            id="chronologie-source"
            className="select"
            value={filters.source}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                source: event.currentTarget.value,
              }))
            }
          >
            <option value="toutes_sources">Toutes sources</option>
            <option value="s-2025-04-001">HashCode Blog</option>
            <option value="s-2025-04-002">Security News</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <p className="cell-muted">Chargement de la chronologie…</p>
      ) : visible.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">≋</div>
          <h2>Aucun événement</h2>
          <p>La chronologie se remplira après une collecte persistée.</p>
        </div>
      ) : (
        <div className="stack">
          {visible.map((evenement) => (
            <article key={`${evenement.date}-${evenement.titre}`} className="panel">
              <div className="panel-body" style={{ display: "flex", gap: 12 }}>
                <span className="cell-mono" aria-hidden="true">
                  {evenement.icone}
                </span>
                <div>
                  <p>{evenement.titre}</p>
                  <p className="cell-muted">{evenement.description}</p>
                </div>
                <span className="badge" style={{ marginLeft: "auto" }}>
                  {evenement.type}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
