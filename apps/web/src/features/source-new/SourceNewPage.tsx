import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { PageHeader } from "../../components/layout/PageHeader";
import { useToast } from "../../components/ui/toast";
import { createSource, sourcesKeys } from "../sources/api/sources.queries";
import { SourceNewFormSchema } from "./validators/source-new.schema";
import { SOURCE_TYPE_LABEL, type SourceNewFormValues, type SourceType } from "./types/source-new.types";

const initialValues: SourceNewFormValues = { nom: "", url: "", type: "web", domaines: [] };
export function SourceNewPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [values, setValues] = useState<SourceNewFormValues>(initialValues);
  const [domainsText, setDomainsText] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  function update<K extends keyof SourceNewFormValues>(key: K, value: SourceNewFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = { ...values, domaines: domainsText.split(",").map((domain) => domain.trim()).filter(Boolean) };
    const parsed = SourceNewFormSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next); return;
    }
    setErrors({}); setSaving(true);
    try {
      await createSource(parsed.data);
      await queryClient.invalidateQueries({ queryKey: sourcesKeys.all });
      push({ title: "Source créée", description: "La source a été enregistrée par le moteur.", variant: "success" });
      await navigate({ to: "/sources" });
    } catch (error) {
      push({ title: "Création impossible", description: error instanceof Error ? error.message : "Erreur API inconnue", variant: "warning" });
    } finally { setSaving(false); }
  }
  return <>
    <PageHeader title="Nouvelle source" description="Enregistrez une source et son périmètre autorisé. Les champs correspondent au contrat SourceCreateIn du backend." />
    <form onSubmit={handleCreate} className="max-w-3xl space-y-6">
      <Card><CardHeader><CardTitle>Contrat de création de source</CardTitle></CardHeader><CardContent className="space-y-5">
        <div className="space-y-1.5"><Label htmlFor="source-nom">Nom de la source</Label><Input id="source-nom" value={values.nom} maxLength={120} onChange={(event) => update("nom", event.target.value)} placeholder="Nom de la source" required />{errors.nom ? <p role="alert" className="text-xs text-red">{errors.nom}</p> : null}<p className="text-xs text-ink-muted">1 à 120 caractères.</p></div>
        <div className="space-y-1.5"><Label htmlFor="source-type">Type</Label><select id="source-type" className="h-10 w-full rounded-[10px] border border-line bg-card-2 px-3 text-[13px] text-ink" value={values.type} onChange={(event) => update("type", event.target.value as SourceType)}>{Object.entries(SOURCE_TYPE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
        <div className="space-y-1.5"><Label htmlFor="source-url">URL de base</Label><Input id="source-url" type="url" maxLength={4096} value={values.url} onChange={(event) => update("url", event.target.value)} placeholder="https://example.org" required />{errors.url ? <p role="alert" className="text-xs text-red">{errors.url}</p> : null}</div>
        <div className="space-y-1.5"><Label htmlFor="source-domaines">Domaines autorisés</Label><Input id="source-domaines" value={domainsText} onChange={(event) => setDomainsText(event.target.value)} placeholder="example.org, docs.example.org" required /><p className="text-xs text-ink-muted">Séparez les hôtes par des virgules. Au moins un domaine est obligatoire.</p>{errors.domaines ? <p role="alert" className="text-xs text-red">{errors.domaines}</p> : null}</div>
      </CardContent></Card>
      <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => void navigate({ to: "/sources" })}>Annuler</Button><Button type="submit" variant="primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer la source"}</Button></div>
    </form>
  </>;
}
