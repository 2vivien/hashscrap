import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { useToast } from "../../components/ui/toast";
import { CollectesFilters } from "./components/CollectesFilters";
import { CollectesTable } from "./components/CollectesTable";
import { useCollectes } from "./hooks/useCollectes";
import type { Collecte, CollecteFilters } from "./types/collectes.types";

const EMPTY_FILTERS: CollecteFilters = { search: "", status: "all", type: "all" };

export function CollectesPage() {
  const { push } = useToast();
  const { data, isPending, isError, refetch } = useCollectes();
  const [filters, setFilters] = useState<CollecteFilters>(EMPTY_FILTERS);
  const [extra, setExtra] = useState<Collecte[]>([]);

  const all = useMemo(() => [...extra, ...(data?.items ?? [])], [extra, data]);

  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return all.filter((collecte) => {
      if (filters.status !== "all" && collecte.status !== filters.status) return false;
      if (filters.type !== "all" && collecte.type !== filters.type) return false;
      if (!search) return true;
      return (
        collecte.id.toLowerCase().includes(search) || collecte.source.toLowerCase().includes(search)
      );
    });
  }, [all, filters]);

  function launchCollecte() {
    const id = `C-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(extra.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const collecte: Collecte = {
      id,
      source: "techcorp.io",
      type: "web",
      status: "en_cours",
      progress: 0,
      pages: 0,
      duration: "0h00m",
      started_at: now,
    };
    setExtra((current) => [collecte, ...current]);
    push({ title: "Collecte lancée", description: `${id} a été ajoutée à la liste.`, variant: "success" });
  }

  return (
    <>
      <PageHeader
        title="Collectes"
        description="Liste des jobs d'acquisition • Bounded collection"
        actions={
          <Button variant="primary" onClick={launchCollecte}>
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
