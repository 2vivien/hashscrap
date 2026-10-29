import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useToast } from "../../components/ui/toast";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { ActivityFeed } from "./components/ActivityFeed";
import { AttentionPoints } from "./components/AttentionPoints";
import { RecentCollectesTable } from "./components/RecentCollectesTable";
import { StatCards } from "./components/StatCards";
import { useDashboard } from "./hooks/useDashboard";
import { useSources } from "../sources/hooks/useSources";
import { launchCollecte, collectesKeys } from "../collectes/api/collectes.queries";
import { dashboardKeys } from "./api/dashboard.queries";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const { push } = useToast();
  const { data, isPending, isError, refetch } = useDashboard();
  const { data: sourcesData, isPending: sourcesPending, isError: sourcesError } = useSources();

  async function handleLaunch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
    } catch { setFormError("Saisissez une URL HTTP ou HTTPS valide."); return; }
    if (!source) { setFormError("Sélectionnez une source enregistrée."); return; }
    setSaving(true);
    try {
      await launchCollecte({ source, url });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: collectesKeys.all }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
      setOpen(false); setSource(""); setUrl("");
      push({ title: "Collecte lancée", description: "Le moteur a confirmé la création du job.", variant: "success" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Impossible de lancer la collecte.");
    } finally { setSaving(false); }
  }

  if (isPending) return <LoadingSkeleton label="Chargement du tableau de bord…" />;
  if (isError || !data) return <ErrorState onRetry={() => void refetch()} />;

  return <>
    <PageHeader
      title="Tableau de bord"
      description={`État des collectes persistées · ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}`}
      status={<span className="mono rounded-full bg-lime-dim px-2 py-1 text-[11px] text-lime">Données du moteur</span>}
      actions={<><Button asChild variant="secondary"><Link to="/collectes">Voir les collectes</Link></Button><Button variant="primary" onClick={() => setOpen(true)}><Plus /> Nouvelle collecte</Button></>}
    />
    <StatCards stats={data.stats} />
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]"><RecentCollectesTable collectes={data.collectes} /><div className="flex flex-col gap-4"><ActivityFeed items={data.activite} /><AttentionPoints points={data.points_attention} /></div></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent>
      <DialogHeader><DialogTitle>Lancer une collecte</DialogTitle><DialogDescription>Cette action crée réellement un job via POST /api/v1/collectes.</DialogDescription></DialogHeader>
      <form id="dashboard-launch-collecte" onSubmit={handleLaunch} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5"><Label htmlFor="dash-source">Source enregistrée</Label><select id="dash-source" className="h-10 w-full rounded-[10px] border border-line bg-card-2 px-3 text-[13px] text-ink" value={source} onChange={(event) => setSource(event.target.value)} disabled={sourcesPending || !sourcesData?.items.length} required><option value="">{sourcesPending ? "Chargement…" : "Sélectionner une source"}</option>{(sourcesData?.items ?? []).map((item) => <option key={item.id} value={item.id}>{item.nom} · {item.id}</option>)}</select>
          {sourcesError ? <p className="text-xs text-red">Impossible de charger les sources depuis l’API.</p> : null}
          {!sourcesPending && !sourcesError && !sourcesData?.items.length ? <p className="text-xs text-ink-muted">Aucune source disponible. Créez d’abord une source.</p> : null}
        </div>
        <div className="flex flex-col gap-1.5"><Label htmlFor="dash-url">URL de départ</Label><Input id="dash-url" type="url" maxLength={4096} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://example.org" required /></div>
        {formError ? <p role="alert" className="text-xs text-red">{formError}</p> : null}
      </form>
      <DialogFooter><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" type="submit" form="dashboard-launch-collecte" disabled={saving || sourcesPending || !source || !url.trim()}>{saving ? "Lancement…" : "Lancer la collecte"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
