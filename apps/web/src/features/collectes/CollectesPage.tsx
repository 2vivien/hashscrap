import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { useSources } from "../sources/hooks/useSources";
import { launchCollecte, collectesKeys } from "./api/collectes.queries";
import type { CollecteFilters } from "./types/collectes.types";

const EMPTY_FILTERS: CollecteFilters = { search: "", status: "all", type: "all" };

export function CollectesPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useCollectes();
  const { data: sourcesData, isPending: sourcesPending, isError: sourcesError } = useSources();
  const [filters, setFilters] = useState<CollecteFilters>(EMPTY_FILTERS);
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [launching, setLaunching] = useState(false);
  const [formError, setFormError] = useState("");

  const items = useMemo(() => (data?.items ?? []).filter((collecte) => {
    if (filters.status !== "all" && collecte.status !== filters.status) return false;
    if (filters.type !== "all" && collecte.type !== filters.type) return false;
    const search = filters.search.trim().toLowerCase();
    return !search || collecte.id.toLowerCase().includes(search) || collecte.source.toLowerCase().includes(search);
  }), [data, filters]);

  async function handleLaunch() {
    setFormError("");
    try { const parsed = new URL(url); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); }
    catch { setFormError("Saisissez une URL HTTP ou HTTPS valide."); return; }
    if (!source) { setFormError("Sélectionnez une source enregistrée."); return; }
    setLaunching(true);
    try {
      await launchCollecte({ source, url });
      await queryClient.invalidateQueries({ queryKey: collectesKeys.all });
      setOpen(false);
      setSource("");
      setUrl("");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Impossible de lancer la collecte.");
    } finally { setLaunching(false); }
  }

  return <>
    <PageHeader title="Collectes" description="Jobs de collecte persistés par le moteur." actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus /> Lancer une collecte</Button>} />
    <CollectesFilters filters={filters} onChange={setFilters} />
    <Card><CardContent className="p-0">
      {isPending ? <LoadingSkeleton label="Chargement des collectes…" /> : null}
      {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
      {!isPending && !isError ? <CollectesTable collectes={items} /> : null}
    </CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent>
      <DialogHeader><DialogTitle>Lancer une collecte</DialogTitle><DialogDescription>Le moteur attend la clé d’une source existante et l’URL de départ.</DialogDescription></DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label htmlFor="collecte-source">Source enregistrée</Label>
          <select id="collecte-source" className="h-10 w-full rounded-[10px] border border-line bg-card-2 px-3 text-[13px] text-ink" value={source} onChange={(event) => setSource(event.target.value)} disabled={sourcesPending || !sourcesData?.items.length}>
            <option value="">{sourcesPending ? "Chargement…" : "Sélectionner une source"}</option>
            {(sourcesData?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.nom} · {item.id}</option>)}
          </select>
          {sourcesError ? <p className="text-xs text-red">Impossible de charger les sources depuis l’API.</p> : null}
          {!sourcesPending && !sourcesError && !sourcesData?.items.length ? <p className="text-xs text-ink-muted">Aucune source n’est enregistrée. Créez-en une avant de lancer une collecte.</p> : null}
        </div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="collecte-url">URL de départ</Label><Input id="collecte-url" type="url" maxLength={4096} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.org" required /></div>
        {formError ? <p role="alert" className="text-xs text-red">{formError}</p> : null}
      </div>
      <DialogFooter><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={handleLaunch} disabled={launching || sourcesPending || !source || !url.trim()}>{launching ? "Lancement…" : "Lancer la collecte"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
