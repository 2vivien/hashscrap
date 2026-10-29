import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { ErrorState, LoadingSkeleton, EmptyState } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { PreuvesTable } from "./components/PreuvesTable";
import { usePreuves } from "./hooks/usePreuves";
import type { PreuvesFilters } from "./types/preuves.types";

const EMPTY_FILTERS: PreuvesFilters = { search: "", statut: "all" };
export function PreuvesPage() {
  const { data, isPending, isError, refetch } = usePreuves();
  const [filters, setFilters] = useState<PreuvesFilters>(EMPTY_FILTERS);
  const items = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return (data?.items ?? []).filter((preuve) => {
      if (filters.statut !== "all" && preuve.statut !== filters.statut) return false;
      return !search || preuve.url.toLowerCase().includes(search) || preuve.sha256.toLowerCase().includes(search);
    });
  }, [data, filters]);
  function exportJson() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "hashscrap-preuves.json"; anchor.click();
    URL.revokeObjectURL(url);
  }
  return <>
    <PageHeader title="Preuves" description="Archives horodatées retournées par le moteur." actions={<Button variant="secondary" onClick={exportJson} disabled={isPending || isError || !items.length}><Download /> Exporter JSON</Button>} />
    <div className="mb-4"><Input placeholder="Rechercher URL, SHA-256…" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} icon={<Search className="size-4 text-ink-muted" />} /></div>
    <Card><CardContent className="p-0">{isPending ? <LoadingSkeleton label="Chargement des preuves…" /> : null}{isError ? <ErrorState onRetry={() => void refetch()} /> : null}{!isPending && !isError ? items.length ? <PreuvesTable preuves={items} /> : <EmptyState title="Aucune preuve" description="Aucune preuve ne correspond aux données renvoyées par l’API et aux filtres actuels." /> : null}</CardContent></Card>
  </>;
}
