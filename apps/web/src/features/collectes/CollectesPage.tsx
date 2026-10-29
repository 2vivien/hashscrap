import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { PageHeader } from "../../components/layout/PageHeader";
import { CollectesFilters } from "./components/CollectesFilters";
import { CollectesTable } from "./components/CollectesTable";
import { useCollectes } from "./hooks/useCollectes";
import { launchCollecte } from "./api/collectes.queries";
import type { Collecte, CollecteFilters } from "./types/collectes.types";

const EMPTY_FILTERS: CollecteFilters = { search: "", status: "all", type: "all" };

export function CollectesPage() {
  const { data, isPending, isError, refetch } = useCollectes();
  const [filters, setFilters] = useState<CollecteFilters>(EMPTY_FILTERS);
  const [extra, setExtra] = useState<Collecte[]>([]);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("techcorp.io");
  const [url, setUrl] = useState("");

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

  async function handleLaunch() {
    try {
      const collecte = await launchCollecte({ source: source || "techcorp.io", url: url || "https://techcorp.io" });
      setExtra((current) => [collecte, ...current]);
      setOpen(false);
      setUrl("");
    } catch (err) {
      alert(`Erreur : ${err}`);
    }
  }

  return (
    <>
      <PageHeader
        title="Collectes"
        description="Liste des jobs d'acquisition • Bounded collection"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lancer une collecte</DialogTitle>
            <DialogDescription>
              Configurez une nouvelle collecte bornée.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="collecte-source">Source</Label>
              <Input id="collecte-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="techcorp.io" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="collecte-url">URL de départ</Label>
              <Input id="collecte-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://techcorp.io" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleLaunch}>Lancer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
