import { useMemo, useState } from "react";
import { DemoBanner } from "../../components/ui/DemoBanner";
import { CollectesFilters } from "./components/CollectesFilters";
import { CollecteTable } from "./components/CollecteTable";
import { useCollectes } from "./api/collecte.queries";
import type { CollecteFilters } from "./types/collecte.types";

export function CollectesPage() {
  const { data: collectes = [], isLoading } = useCollectes();
  const [filters, setFilters] = useState<CollecteFilters>({ search: "" });

  const visible = useMemo(() => {
    const search = filters.search?.trim().toLowerCase();
    return collectes.filter((collecte) => {
      if (filters.statut && collecte.statut !== filters.statut) return false;
      if (filters.type && collecte.type !== filters.type) return false;
      if (!search) return true;
      return (
        collecte.id.toLowerCase().includes(search) ||
        collecte.source.toLowerCase().includes(search)
      );
    });
  }, [collectes, filters]);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EXÉCUTION / TÂCHES</p>
          <h1>Collectes</h1>
          <p className="page-description">
            Suivez l’état des tâches, les compteurs et les erreurs de collecte.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          title="Disponible lorsque l’API de lancement de collecte sera exposée"
        >
          <span aria-hidden="true">＋</span> Lancer une collecte
        </button>
      </div>

      <DemoBanner message="Les tâches ci-dessous sont fictives : le moteur n’expose pas encore d’API de collecte." />

      <CollectesFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <p className="cell-muted">Chargement des collectes…</p>
      ) : visible.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">↻</div>
          <h2>Aucune collecte à afficher</h2>
          <p>Ajustez les filtres ou lancez une collecte pour obtenir des résultats.</p>
        </div>
      ) : (
        <CollecteTable collectes={visible} />
      )}
    </>
  );
}
