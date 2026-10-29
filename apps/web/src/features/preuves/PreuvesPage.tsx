import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { PreuvesTable } from "./components/PreuvesTable";
import { usePreuves } from "./hooks/usePreuves";
import type { PreuvesFilters } from "./types/preuves.types";

const EMPTY_FILTERS: PreuvesFilters = { search: "", statut: "all" };

/**
 * Display the proofs exposed by the engine.
 */
export function PreuvesPage() {
  const { data, isPending, isError, refetch } = usePreuves();
  const [filters, setFilters] = useState<PreuvesFilters>(EMPTY_FILTERS);

  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((preuve) => {
      if (filters.statut !== "all" && preuve.statut !== filters.statut) return false;
      if (!search) return true;
      return (
        preuve.url.toLowerCase().includes(search) ||
        preuve.sha256.toLowerCase().includes(search)
      );
    });
  }, [data, filters]);

  return (
    <>
      <PageHeader
        title="Preuves"
        description="Archives horodatées et vérifiables"
        actions={[
          <Button
            key="export"
            variant="secondary"
            disabled
            title="Disponible quand l'API d'export sera exposée"
          >
            <Download />
            Exporter sélection
          </Button>,
        ]}
      />

      <div className="mb-4">
        <Input
          placeholder="Rechercher URL, SHA-256..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          icon={<Search className="size-4 text-ink-muted" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement des preuves..." /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <PreuvesTable preuves={items} /> : null}
        </CardContent>
      </Card>
    </>
  );
}
