import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { SourcesFilters } from "./components/SourcesFilters";
import { SourcesSidePanel } from "./components/SourcesSidePanel";
import { SourcesTable } from "./components/SourcesTable";
import { useSources } from "./hooks/useSources";
import type { SourceFilters } from "./types/sources.types";

const EMPTY_FILTERS: SourceFilters = { search: "", type: "all", statut: "all" };

export function SourcesPage() {
  const { data, isPending, isError, refetch } = useSources();
  const [filters, setFilters] = useState<SourceFilters>(EMPTY_FILTERS);

  const sources = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((source) => {
      if (filters.type !== "all" && source.type !== filters.type) return false;
      if (filters.statut !== "all" && source.statut !== filters.statut) return false;
      if (!search) return true;
      return (
        source.nom.toLowerCase().includes(search) ||
        source.url.toLowerCase().includes(search) ||
        source.domaines.some((domain) => domain.toLowerCase().includes(search))
      );
    });
  }, [data, filters]);

  return (
    <>
      <PageHeader
        title="Sources"
        description="Gérez vos points d'entrée de collecte"
        actions={
          <Button asChild variant="primary">
            <Link to="/source-new">
              <Plus /> Nouvelle source
            </Link>
          </Button>
        }
      />

      <SourcesFilters filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="p-0">
            {isPending ? <LoadingSkeleton label="Chargement des sources…" /> : null}
            {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
            {!isPending && !isError ? (
              <>
                <p className="px-4 py-3 text-[12px] text-ink-muted">{sources.length} sources</p>
                <SourcesTable sources={sources} />
              </>
            ) : null}
          </CardContent>
        </Card>
        <SourcesSidePanel sources={sources} />
      </div>
    </>
  );
}
