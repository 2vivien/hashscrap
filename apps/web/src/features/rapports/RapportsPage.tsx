import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { RapportsTable } from "./components/RapportsTable";
import { useRapports } from "./hooks/useRapports";
import type { Rapport } from "./types/rapports.types";

export function RapportsPage() {
  const { data, isPending, isError, refetch } = useRapports();
  const [extra, setExtra] = useState<Rapport[]>([]);
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");

  const items = useMemo(() => [...extra, ...(data?.items ?? [])], [extra, data]);

  function createRapport() {
    const id = `r-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(extra.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const rapport: Rapport = {
      id,
      titre: titre || "Nouveau rapport",
      investigation: "Opération TechLeak",
      statut: "en_attente",
      genere_le: now,
      format: "markdown",
      contenu: "# Nouveau rapport\n\nContenu à générer.",
    };
    setExtra((current) => [rapport, ...current]);
    setOpen(false);
    setTitre("");
  }

  return (
    <>
      <PageHeader
        title="Rapports"
        description="Générez des livrables d'investigation"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            <Plus /> Nouveau rapport
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isPending ? <LoadingSkeleton label="Chargement des rapports…" /> : null}
          {isError ? <ErrorState onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? <RapportsTable rapports={items} /> : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau rapport</DialogTitle>
            <DialogDescription>Générez un livrable d'investigation.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rapport-titre">Titre</Label>
            <Input id="rapport-titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre du rapport" />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
            <Button variant="primary" onClick={createRapport}>Générer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
