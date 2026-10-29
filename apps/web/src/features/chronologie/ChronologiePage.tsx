import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { useToast } from "../../components/ui/toast";
import { ChronologieFilters } from "./components/ChronologieFilters";
import { ChronologieTimeline } from "./components/ChronologieTimeline";
import { useChronologie } from "./hooks/useChronologie";
import type { ChronologieFilters as ChronologieFiltersValues } from "./types/chronologie.types";

const EMPTY_FILTERS: ChronologieFiltersValues = { startDate: "", endDate: "" };

export function ChronologiePage() {
  const { push } = useToast();
  const { data, isPending, isError, refetch } = useChronologie();
  const [filters, setFilters] = useState<ChronologieFiltersValues>(EMPTY_FILTERS);

  const items = useMemo(() => {
    return (data?.items ?? []).filter((event) => {
      if (filters.startDate && new Date(event.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(event.date) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [data, filters]);

  return (
    <>
      <PageHeader
        title="Chronologie"
        description="Vue temporelle de tous les événements"
        actions={(
          <Button
          variant="secondary"
          onClick={() => push({ title: "Filtrage par type", description: "Cette action sera disponible quand le moteur sera connecté." })}
        >
            <Filter /> Filtrer par type
          </Button>
        )}
      />

      <ChronologieFilters filters={filters} onChange={setFilters} />

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement de la chronologie…" /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <ChronologieTimeline events={items} /> : null}
        </CardContent>
      </Card>
    </>
  );
}