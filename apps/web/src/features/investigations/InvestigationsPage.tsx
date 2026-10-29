import { useMemo, useState } from "react";
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
import type { Investigation } from "./types/investigations.types";

export function InvestigationsPage() {
  const { data, isPending, isError, refetch } = useInvestigations();
  const [search, setSearch] = useState("");
  const [extra, setExtra] = useState<Investigation[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const all = useMemo(() => [...extra, ...(data?.items ?? [])], [extra, data]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((inv) => !q || inv.nom.toLowerCase().includes(q) || inv.description.toLowerCase().includes(q));
  }, [all, search]);

  function createInvestigation() {
    const id = `inv-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(extra.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const inv: Investigation = {
      id,
      nom: name || "Nouvelle investigation",
      description: description || "Dossier créé depuis l'interface",
      statut: "en_cours",
      sources: 0,
      observations: 0,
      derniere_activite: now,
    };
    setExtra((current) => [inv, ...current]);
    setOpen(false);
    setName("");
    setDescription("");
  }

  return (
    <>
      <PageHeader
        title="Investigations"
        description="Gérez vos dossiers d'enquête et leur périmètre"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <Plus /> Nouvelle investigation
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Rechercher une investigation..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="size-4 text-ink-muted" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement des investigations…" /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <InvestigationsTable investigations={items} /> : null}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <InvestigationsStats />
        <InvestigationsDistribution />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle investigation</DialogTitle>
            <DialogDescription>Créez un nouveau dossier d'enquête.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-nom">Nom</Label>
              <Input id="inv-nom" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de l'investigation" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inv-desc">Description</Label>
              <Input id="inv-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={createInvestigation}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
