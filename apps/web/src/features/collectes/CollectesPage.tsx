import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { CollectesFilters } from "./components/CollectesFilters";
import { CollectesTable } from "./components/CollectesTable";
import { useCollectes } from "./hooks/useCollectes";
import type { CollecteFilters } from "./types/collectes.types";

const EMPTY_FILTERS: CollecteFilters = { search: "", status: "all", type: "all" };

export function CollectesPage() {
  const { data, isPending, isError, refetch } = useCollectes();
  const [filters, setFilters] = useState<CollecteFilters>(EMPTY_FILTERS);

  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((collecte) => {
      if (filters.status !== "all" && collecte.status !== filters.status) return false;
      if (filters.type !== "all" && collecte.type !== filters.type) return false;
      if (!search) return true;
      return (
        collecte.id.toLowerCase().includes(search) || collecte.source.toLowerCase().includes(search)
      );
    });
  }, [data, filters]);

  return (
    <>
      <PageHeader
        title="Collectes"
        description="Liste des jobs d'acquisition • Bounded collection"
        actions={
          <Button variant="primary" disabled title="Disponible quand l'API de lancement sera exposée">
            <Plus /> Lancer une collecte
          </Button>
        }
      />

      <CollectesFilters filters={filters} onChange={setFilters} />

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement des collectes…" /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <CollectesTable collectes={items} /> : null}
        </CardContent>
      </Card>
    </>
  );
}
