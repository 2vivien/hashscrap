import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { PageHeader } from "../../components/layout/PageHeader";
import { useSourceDefaults } from "./hooks/useSourceDefaults";
import { createSource } from "../sources/api/sources.queries";
import { useToast } from "../../components/ui/toast";
import type { SourceNewFormValues, SourceNewStep } from "./types/source-new.types";

const STEPS: SourceNewStep[] = ["informations", "validation", "recap"];

export function SourceNewPage() {
  const { push } = useToast();
  const { data, isPending, isError, refetch } = useSourceDefaults();
  const [step, setStep] = useState<SourceNewStep>("informations");
  const [values, setValues] = useState<SourceNewFormValues>({
    name: "",
    type: "web",
    base_url: "",
    allowed_hosts: "",
    limits: {
      timeout_seconds: 10,
      concurrency: 2,
      requests_per_second: 1,
      max_depth: 2,
      max_pages: 5000,
      max_response_bytes: 1000000,
    },
  });
  const [saving, setSaving] = useState(false);

  if (isPending) {
    return <LoadingSkeleton label="Chargement des valeurs par défaut…" />;
  }
  if (isError || !data) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  async function handleCreate() {
    setSaving(true);
    try {
      const domaines = values.allowed_hosts
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);
      await createSource({
        nom: values.name,
        url: values.base_url,
        type: values.type,
        domaines: domaines.length > 0 ? domaines : [new URL(values.base_url).hostname],
      });
      push({ title: "Source créée", description: `${values.name} a été enregistrée.`, variant: "success" });
      setValues({ name: "", type: "web", base_url: "", allowed_hosts: "", limits: data!.limits });
      setStep("informations");
    } catch (err) {
      push({ title: "Erreur", description: String(err), variant: "warning" });
    } finally {
      setSaving(false);
    }
  }

  const stepIndex = STEPS.indexOf(step);

  return (
    <>
      <PageHeader title="Nouvelle source" description="Déclarez un point de départ autorisé, sa portée et ses limites de collecte." />

      <div className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`rounded-[10px] border px-3 py-2 text-[12px] transition-colors ${
              step === s ? "border-lime/40 bg-lime-dim text-lime" : "border-line bg-card text-ink-secondary hover:text-ink"
            }`}
          >
            {i + 1}. {s === "informations" ? "Informations" : s === "validation" ? "Validation" : "Récapitulatif"}
          </button>
        ))}
      </div>

      {step === "informations" ? (
        <Card>
          <CardHeader>
            <CardTitle>Informations de la source</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="src-name">Nom</Label>
              <Input id="src-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Nom de la source" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="src-type">Type</Label>
              <select
                id="src-type"
                className="h-10 w-full rounded-[10px] border border-line bg-card-2 px-3 text-[13px] text-ink"
                value={values.type}
                onChange={(e) => setValues({ ...values, type: e.target.value as SourceNewFormValues["type"] })}
              >
                <option value="web">Site web</option>
                <option value="api">API</option>
                <option value="reseau">Réseau</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="src-url">URL de base</Label>
              <Input id="src-url" type="url" value={values.base_url} onChange={(e) => setValues({ ...values, base_url: e.target.value })} placeholder="https://example.org" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="src-hosts">Domaines autorisés</Label>
              <Input id="src-hosts" value={values.allowed_hosts} onChange={(e) => setValues({ ...values, allowed_hosts: e.target.value })} placeholder="example.org, api.example.org" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "validation" ? (
        <Card>
          <CardHeader>
            <CardTitle>Validation du périmètre</CardTitle>
          </CardHeader>
          <CardContent className="text-[13px] text-ink-secondary">
            <p>Les contrôles de protocole HTTPS, de résolution DNS et d'accessibilité sont exécutés par le moteur au moment de l'enregistrement.</p>
          </CardContent>
        </Card>
      ) : null}

      {step === "recap" ? (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-[13px]">
            <p><span className="text-ink-muted">Nom :</span> {values.name || "—"}</p>
            <p><span className="text-ink-muted">Type :</span> {values.type}</p>
            <p><span className="text-ink-muted">URL :</span> {values.base_url || "—"}</p>
            <p><span className="text-ink-muted">Domaines :</span> {values.allowed_hosts || "—"}</p>
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6 flex gap-2">
        <Button variant="secondary" disabled={stepIndex === 0} onClick={() => setStep(STEPS[Math.max(stepIndex - 1, 0)])}>
          Précédent
        </Button>
        {stepIndex < STEPS.length - 1 ? (
          <Button variant="primary" onClick={() => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)])}>
            Suivant
          </Button>
        ) : (
          <Button variant="primary" disabled={saving || !values.name || !values.base_url} onClick={handleCreate}>
            {saving ? "Enregistrement…" : "Créer la source"}
          </Button>
        )}
      </div>
    </>
  );
}
