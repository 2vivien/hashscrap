import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { RapportsTable } from "./components/RapportsTable";
import { useRapports } from "./hooks/useRapports";
import type { RapportsFilters } from "./types/rapports.types";

const EMPTY_FILTERS: RapportsFilters = { search: "", statut: "all", format: "all" };

/**
 * Display the reports exposed by the engine.
 */
export function RapportsPage() {
  const { data, isPending, isError, refetch } = useRapports();
  const [filters, setFilters] = useState<RapportsFilters>(EMPTY_FILTERS);

  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((rapport) => {
      if (filters.statut !== "all" && rapport.statut !== filters.statut) return false;
      if (filters.format !== "all" && rapport.format !== filters.format) return false;
      if (!search) return true;
      return (
        rapport.titre.toLowerCase().includes(search) ||
        rapport.investigation.toLowerCase().includes(search)
      );
    });
  }, [data, filters]);

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Générez des livrables d'investigation"
        actions={[
          <Button
            key="new"
            variant="primary"
            disabled
            title="Disponible quand l'API de création sera exposée"
          >
            <Plus />
            Nouveau rapport
          </Button>,
        ]}
      />

      <div className="mb-4">
        <Input
          placeholder="Rechercher titre, investigation..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          icon={<Search className="size-4 text-ink-muted" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement des rapports..." /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <RapportsTable rapports={items} /> : null}
        </CardContent>
      </Card>
    </>
  );
}
