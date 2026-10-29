import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { InvestigationsTable } from "./components/InvestigationsTable";
import { InvestigationsStats } from "./components/InvestigationsStats";
import { InvestigationsDistribution } from "./components/InvestigationsDistribution";
import { useInvestigations } from "./hooks/useInvestigations";
import { createInvestigation, investigationsKeys } from "./api/investigations.queries";

export function InvestigationsPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useInvestigations();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const investigations = data?.items ?? [];
  const items = useMemo(() => investigations.filter((item) => {
    const q = search.trim().toLowerCase();
    return !q || item.nom.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  }), [investigations, search]);

  async function handleCreate() {
    const nom = name.trim();
    if (!nom || nom.length > 160) { setFormError("Le nom est obligatoire et limité à 160 caractères."); return; }
    setSaving(true); setFormError("");
    try {
      await createInvestigation({ nom, description });
      await queryClient.invalidateQueries({ queryKey: investigationsKeys.all });
      setOpen(false); setName(""); setDescription("");
    } catch (error) { setFormError(error instanceof Error ? error.message : "Impossible de créer l’investigation."); }
    finally { setSaving(false); }
  }

  return <>
    <PageHeader title="Investigations" description="Dossiers d’enquête persistés par le moteur." actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus /> Nouvelle investigation</Button>} />
    <div className="mb-4"><Input placeholder="Rechercher une investigation…" value={search} onChange={(event) => setSearch(event.target.value)} icon={<Search className="size-4 text-ink-muted" />} /></div>
    <Card><CardContent className="p-0">{isPending ? <LoadingSkeleton label="Chargement des investigations…" /> : null}{isError ? <ErrorState onRetry={() => void refetch()} /> : null}{!isPending && !isError ? <InvestigationsTable investigations={items} /> : null}</CardContent></Card>
    {!isPending && !isError ? <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]"><InvestigationsStats investigations={investigations} /><InvestigationsDistribution investigations={investigations} /></div> : null}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent>
      <DialogHeader><DialogTitle>Nouvelle investigation</DialogTitle><DialogDescription>Les champs correspondent à InvestigationCreateIn.</DialogDescription></DialogHeader>
      <div className="flex flex-col gap-4"><div className="flex flex-col gap-1.5"><Label htmlFor="inv-nom">Nom</Label><Input id="inv-nom" maxLength={160} value={name} onChange={(event) => setName(event.target.value)} required /></div><div className="flex flex-col gap-1.5"><Label htmlFor="inv-desc">Description (facultative)</Label><Input id="inv-desc" value={description} onChange={(event) => setDescription(event.target.value)} /></div>{formError ? <p role="alert" className="text-xs text-red">{formError}</p> : null}</div>
      <DialogFooter><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={handleCreate} disabled={saving || !name.trim()}>{saving ? "Création…" : "Créer"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
