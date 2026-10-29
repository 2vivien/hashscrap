import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { InvestigationsTable } from "./components/InvestigationsTable";
import { InvestigationsStats } from "./components/InvestigationsStats";
import { InvestigationsDistribution } from "./components/InvestigationsDistribution";
import { useInvestigations } from "./hooks/useInvestigations";
import type { InvestigationFilters } from "./types/investigations.types";

const EMPTY_FILTERS: InvestigationFilters = { search: "" };

interface InvestigationsPageProps {
  // Add any props if needed
}

export function InvestigationsPage({}: InvestigationsPageProps) {
  const { data, isPending, isError, refetch } = useInvestigations();
  const [filters, setFilters] = useState<InvestigationFilters>(EMPTY_FILTERS);

  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((investigation) => {
      if (!search) return true;
      return (
        investigation.nom.toLowerCase().includes(search) ||
        investigation.description.toLowerCase().includes(search)
      );
    });
  }, [data, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investigations"
        description="Gérez vos dossiers d'enquête et leur périmètre"
        actions={
          <Button variant="primary" disabled title="Disponible quand l'API de création sera exposée">
            <Plus /> Nouvelle investigation
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <Input
          placeholder="Rechercher une investigation..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-sm"
          icon={<Search />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {isPending ? <LoadingSkeleton label="Chargement des investigations…" /> : null}
              {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
              {!isPending && !isError ? <InvestigationsTable investigations={items} /> : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <InvestigationsStats />
          <InvestigationsDistribution />
        </div>
      </div>
    </div>
  );
}