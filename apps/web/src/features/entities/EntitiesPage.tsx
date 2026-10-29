import { useMemo, useState } from "react";
import { Download, Merge } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { useToast } from "../../components/ui/toast";
import { EntitiesFilters } from "./components/EntitiesFilters";
import { EntitiesTable } from "./components/EntitiesTable";
import { EntityDetailPanel } from "./components/EntityDetailPanel";
import { useEntities } from "./hooks/useEntities";
import type { EntityFilters } from "./types/entities.types";

const EMPTY_FILTERS: EntityFilters = { search: "", type: "all", confiance: "all" };

export function EntitiesPage() {
  const { push } = useToast();
  const { data, isPending, isError, refetch } = useEntities();
  const [filters, setFilters] = useState<EntityFilters>(EMPTY_FILTERS);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((entity) => {
      if (filters.type !== "all" && entity.type !== filters.type) return false;
      if (filters.confiance !== "all" && entity.confiance !== filters.confiance) return false;
      if (!search) return true;
      return (
        entity.valeur.toLowerCase().includes(search) ||
        entity.type.toLowerCase().includes(search)
      );
    });
  }, [data, filters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
      <div>
        <PageHeader
          title="Entités & relations"
          description="Cartographie des entités extraites et leurs liens"
          actions={(
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(data?.items ?? [], null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "entites.json";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download /> Exporter graphe
              </Button>
              <Button
                variant="secondary"
                onClick={() => push({ title: "Fusion d'entités", description: "Cette action sera disponible quand le moteur sera connecté." })}
              >
                <Merge /> Fusionner
              </Button>
            </>
          )}
        />

        <EntitiesFilters filters={filters} onChange={setFilters} />

        <Card>
          <CardContent className="p-0">
            {isPending ? <LoadingSkeleton label="Chargement des entités…" /> : null}
            {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
            {!isPending && !isError ? (
              <EntitiesTable entities={items} onSelectEntity={setSelectedEntity} />
            ) : null}
          </CardContent>
        </Card>
      </div>

      <EntityDetailPanel entityId={selectedEntity} />
    </div>
  );
}