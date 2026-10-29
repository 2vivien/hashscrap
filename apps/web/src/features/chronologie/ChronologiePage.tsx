import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton, EmptyState } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { ChronologieFilters } from "./components/ChronologieFilters";
import { ChronologieTimeline } from "./components/ChronologieTimeline";
import { useChronologie } from "./hooks/useChronologie";
import type { ChronologieFilters as ChronologieFiltersValues } from "./types/chronologie.types";

const EMPTY_FILTERS: ChronologieFiltersValues = { startDate: "", endDate: "", type: "all" };
export function ChronologiePage() {
  const { data, isPending, isError, refetch } = useChronologie();
  const [filters, setFilters] = useState<ChronologieFiltersValues>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const items = useMemo(() => (data?.items ?? []).filter((event) => {
    if (filters.startDate && event.date < filters.startDate) return false;
    if (filters.endDate && event.date > filters.endDate) return false;
    if (filters.type !== "all" && event.type !== filters.type) return false;
    return true;
  }), [data, filters]);
  return <>
    <PageHeader title="Chronologie" description="Événements persistés retournés par le moteur." actions={<Button variant="secondary" onClick={() => setShowFilters((value) => !value)}><Filter /> Filtrer</Button>} />
    {showFilters ? <ChronologieFilters filters={filters} onChange={setFilters} /> : null}
    <Card><CardContent className="p-0">{isPending ? <LoadingSkeleton label="Chargement de la chronologie…" /> : null}{isError ? <ErrorState onRetry={() => void refetch()} /> : null}{!isPending && !isError ? items.length ? <ChronologieTimeline events={items} /> : <EmptyState title="Aucun événement" description="Aucun événement ne correspond aux données de l’API et aux filtres actuels." /> : null}</CardContent></Card>
  </>;
}
