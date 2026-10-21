import { useMemo, useState } from "react";
import { DemoBanner } from "../../components/ui/DemoBanner";
import { NewSourceForm } from "./components/NewSourceForm";
import { SourcesFilters } from "./components/SourcesFilters";
import { SourcesTable } from "./components/SourcesTable";
import { useSources } from "./api/source.queries";
import type { SourceFilters } from "./types/source.types";

export function SourcesPage() {
  const { data: sources = [], isLoading } = useSources();
  const [filters, setFilters] = useState<SourceFilters>({ search: "" });

  const visible = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    return sources.filter((source) => {
      if (filters.enabled !== undefined && source.enabled !== filters.enabled) return false;
      if (filters.type && source.type !== filters.type) return false;
      if (!search) return true;
      return (
        source.name.toLowerCase().includes(search) ||
        source.base_url.toLowerCase().includes(search) ||
        source.allowed_hosts.some((host) => host.toLowerCase().includes(search))
      );
    });
  }, [sources, filters]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONFIGURATION / SOURCES</p>
          <h1>Sources</h1>
          <p className="page-description">
            Gérez les points de départ autorisés et consultez les refus de validation réseau.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          title="Disponible lorsque l’API de registre des sources sera exposée"
        >
          <span aria-hidden="true">＋</span> Ajouter une source
        </button>
      </div>

      <DemoBanner message="Les sources ci-dessous sont fictives : le registre des sources n’est pas encore exposé par le moteur." />

      <SourcesFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <p className="cell-muted">Chargement des sources…</p>
      ) : visible.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">⌁</div>
          <h2>Aucune source à afficher</h2>
          <p>Ajustez les filtres ou enregistrez une source pour obtenir des résultats.</p>
        </div>
      ) : (
        <SourcesTable sources={visible} />
      )}

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-header">
          <span className="panel-title">Nouvelle source</span>
          <span className="badge badge--amber">Enregistrement non connecté</span>
        </div>
        <div className="panel-body">
          <NewSourceForm
            disabled
            onSubmit={() => {
              // The source registry API is not exposed yet: no write is performed.
            }}
          />
        </div>
      </section>
    </>
  );
}
