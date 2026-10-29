import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ErrorState, LoadingSkeleton } from "../../components/ui/state";
import { PageHeader } from "../../components/layout/PageHeader";
import { SourceNewForm } from "./components/SourceNewForm";
import { SourceNewRecap } from "./components/SourceNewRecap";
import { SourceNewStepper } from "./components/SourceNewStepper";
import { useSourceDefaults } from "./hooks/useSourceDefaults";
import {
  SOURCE_NEW_STEPS,
  type SourceNewFormValues,
  type SourceNewStep,
} from "./types/source-new.types";

export function SourceNewPage() {
  const { data, isPending, isError, refetch } = useSourceDefaults();
  const [step, setStep] = useState<SourceNewStep>("informations");
  const [values, setValues] = useState<SourceNewFormValues | null>(null);

  if (isPending) {
    return <LoadingSkeleton label="Chargement des valeurs par défaut…" />;
  }
  if (isError || !data) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  const formValues: SourceNewFormValues = values ?? {
    name: "",
    type: "web",
    base_url: "",
    allowed_hosts: "",
    limits: data.limits,
  };
  const stepIndex = SOURCE_NEW_STEPS.findIndex((item) => item.value === step);

  return (
    <>
      <PageHeader
        title="Nouvelle source"
        description="Déclarez un point de départ autorisé, sa portée et ses limites de collecte."
      />

      <SourceNewStepper step={step} onStepChange={setStep} />

      {step === "informations" ? (
        <Card>
          <CardHeader>
            <CardTitle>Informations de la source</CardTitle>
          </CardHeader>
          <CardContent>
            <SourceNewForm
              defaults={formValues}
              onSubmit={(next) => {
                setValues(next);
                setStep("validation");
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {step === "validation" ? (
        <Card>
          <CardHeader>
            <CardTitle>Validation du périmètre</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-[13px] text-ink-secondary">
            <p>
              Les contrôles de protocole HTTPS, de résolution DNS et d’accessibilité sont
              exécutés par le moteur au moment de l’enregistrement de la source.
            </p>
            <p>
              Ils ne sont pas encore exposés : cette étape affiche le périmètre déclaré et
              attend la validation du moteur.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {step === "recap" ? <SourceNewRecap values={formValues} /> : null}

      <div className="mt-6 flex items-center gap-2">
        <Button
          variant="secondary"
          disabled={stepIndex === 0}
          onClick={() => setStep(SOURCE_NEW_STEPS[Math.max(stepIndex - 1, 0)].value)}
        >
          Précédent
        </Button>
        {stepIndex < SOURCE_NEW_STEPS.length - 1 ? (
          <Button
            variant="primary"
            onClick={() => setStep(SOURCE_NEW_STEPS[Math.min(stepIndex + 1, SOURCE_NEW_STEPS.length - 1)].value)}
          >
            Suivant
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled
            title="Disponible quand l'API de création de source sera exposée"
          >
            Créer la source
          </Button>
        )}
      </div>
    </>
  );
}
