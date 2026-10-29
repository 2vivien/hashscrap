import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { EntitiesFilters } from "./components/EntitiesFilters";
import { EntitiesTable } from "./components/EntitiesTable";
import { EntityDetailPanel } from "./components/EntityDetailPanel";
import { useEntities } from "./hooks/useEntities";
import type { EntityFilters } from "./types/entities.types";

const EMPTY_FILTERS: EntityFilters = { search: "", type: "all", confiance: "all" };
export function EntitiesPage() {
  const { data, isPending, isError, refetch } = useEntities();
  const [filters, setFilters] = useState<EntityFilters>(EMPTY_FILTERS);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((entity) => {
      if (filters.type !== "all" && entity.type !== filters.type) return false;
      if (filters.confiance !== "all" && entity.confiance !== filters.confiance) return false;
      return !search || entity.valeur.toLowerCase().includes(search) || entity.type.toLowerCase().includes(search);
    });
  }, [data, filters]);
  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "hashscrap-entites.json"; anchor.click();
    URL.revokeObjectURL(url);
  }
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"><div>
    <PageHeader title="Entités & relations" description="Entités et relations retournées par l’API du moteur." actions={<Button variant="secondary" onClick={exportJson} disabled={isPending || isError || !items.length}><Download /> Exporter JSON</Button>} />
    <EntitiesFilters filters={filters} onChange={setFilters} />
    <Card><CardContent className="p-0">{isPending ? <LoadingSkeleton label="Chargement des entités…" /> : null}{isError ? <ErrorState onRetry={() => void refetch()} /> : null}{!isPending && !isError ? <EntitiesTable entities={items} onSelectEntity={setSelectedEntity} /> : null}</CardContent></Card>
  </div><EntityDetailPanel entityId={selectedEntity} /></div>;
}
