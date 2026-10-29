import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { generateRapport, rapportsKeys } from "./api/rapports.queries";

export function RapportsPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useRapports();
  const [open, setOpen] = useState(false);
  const [titre, setTitre] = useState("");
  const [investigation, setInvestigation] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const items = useMemo(() => data?.items ?? [], [data]);

  async function handleCreate() {
    const title = titre.trim();
    if (!title || title.length > 200) { setFormError("Le titre est obligatoire et limité à 200 caractères."); return; }
    setSaving(true); setFormError("");
    try {
      await generateRapport({ titre: title, investigation: investigation.trim() });
      await queryClient.invalidateQueries({ queryKey: rapportsKeys.all });
      setOpen(false); setTitre(""); setInvestigation("");
    } catch (error) { setFormError(error instanceof Error ? error.message : "Impossible de générer le rapport."); }
    finally { setSaving(false); }
  }

  return <>
    <PageHeader title="Rapports" description="Rapports retournés par le moteur d’investigation." actions={<Button variant="primary" onClick={() => setOpen(true)}><Plus /> Nouveau rapport</Button>} />
    <Card><CardContent className="p-0">{isPending ? <LoadingSkeleton label="Chargement des rapports…" /> : null}{isError ? <ErrorState onRetry={() => void refetch()} /> : null}{!isPending && !isError ? <RapportsTable rapports={items} /> : null}</CardContent></Card>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent>
      <DialogHeader><DialogTitle>Nouveau rapport</DialogTitle><DialogDescription>Le backend crée actuellement un rapport Markdown à partir de ce titre, avec une investigation facultative par nom exact.</DialogDescription></DialogHeader>
      <div className="flex flex-col gap-4"><div className="flex flex-col gap-1.5"><Label htmlFor="rapport-titre">Titre</Label><Input id="rapport-titre" maxLength={200} value={titre} onChange={(event) => setTitre(event.target.value)} required /></div><div className="flex flex-col gap-1.5"><Label htmlFor="rapport-investigation">Nom exact de l’investigation (facultatif)</Label><Input id="rapport-investigation" value={investigation} onChange={(event) => setInvestigation(event.target.value)} /></div>{formError ? <p role="alert" className="text-xs text-red">{formError}</p> : null}</div>
      <DialogFooter><Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button><Button variant="primary" onClick={handleCreate} disabled={saving || !titre.trim()}>{saving ? "Génération…" : "Générer"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>;
}
