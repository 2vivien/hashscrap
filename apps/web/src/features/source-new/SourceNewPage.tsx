import { useState } from "react";
import { DemoBanner } from "../../components/ui/DemoBanner";
import type { SourceNewStep, SourceNewFormValues } from "./types/source-new.types";

const STEPS: SourceNewStep[] = ["informations", "validation", "recap"];

const STEP_LABELS: Record<SourceNewStep, string> = {
  informations: "Informations",
  validation: "Validation",
  recap: "Récapitulatif",
};

export function SourceNewPage() {
  const [form, setForm] = useState<SourceNewFormValues>({
    step: "informations",
    step1: { name: "", type: "website", base_url: "" },
    step2: {
      allowed_hosts: [],
      checklist: { protocol_https: true, dns: true, accesibilite_ok: true },
    },
    step3: { max_pages: 100, concurrency: 2 },
  });

  const goToStep = (step: SourceNewStep) => setForm((current) => ({ ...current, step }));
  const stepIndex = STEPS.indexOf(form.step);

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">CONFIGURATION / SOURCES</p>
          <h1>Nouvelle source</h1>
          <p className="page-description">
            Déclarez un point de départ autorisé, sa portée et ses limites de collecte.
          </p>
        </div>
      </div>

      <DemoBanner message="La validation de domaine et l’enregistrement ne sont pas encore reliés au moteur : ce formulaire ne crée aucune source." />

      <div className="tabs" role="tablist">
        {STEPS.map((step, index) => (
          <button
            key={step}
            role="tab"
            aria-selected={form.step === step}
            className={`tab ${form.step === step ? "tab--active" : ""}`}
            onClick={() => goToStep(step)}
          >
            {index + 1}. {STEP_LABELS[step]}
          </button>
        ))}
      </div>

      {form.step === "informations" && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Informations de la source</span>
          </div>
          <div className="panel-body stack">
            <div className="form-grid">
              <div className="field">
                <label className="field-label" htmlFor="new-source-name">
                  Nom
                </label>
                <input
                  id="new-source-name"
                  className="input"
                  required
                  value={form.step1.name}
                  placeholder="Nom de la source"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      step1: { ...current.step1, name: event.currentTarget.value },
                    }))
                  }
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="new-source-type">
                  Type
                </label>
                <select
                  id="new-source-type"
                  className="select"
                  value={form.step1.type}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      step1: {
                        ...current.step1,
                        type: event.currentTarget.value as SourceNewFormValues["step1"]["type"],
                      },
                    }))
                  }
                >
                  <option value="website">Site web</option>
                  <option value="api">API</option>
                  <option value="network">Réseau</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="new-source-url">
                URL de base
              </label>
              <input
                id="new-source-url"
                className="input"
                required
                type="url"
                value={form.step1.base_url}
                placeholder="https://example.org"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    step1: { ...current.step1, base_url: event.currentTarget.value },
                  }))
                }
              />
            </div>
          </div>
        </section>
      )}

      {form.step === "validation" && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Validation du domaine</span>
            <span className="badge badge--amber">Contrôles non exécutés</span>
          </div>
          <div className="panel-body stack">
            <div className="field">
              <label className="field-label" htmlFor="new-source-hosts">
                Domaines autorisés
              </label>
              <input
                id="new-source-hosts"
                className="input"
                value={form.step2.allowed_hosts.join(", ")}
                placeholder="example.org, api.example.org"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    step2: {
                      ...current.step2,
                      allowed_hosts: event.currentTarget.value
                        .split(",")
                        .map((host) => host.trim())
                        .filter((host) => host.length > 0),
                    },
                  }))
                }
              />
            </div>
            <div className="field-grid">
              <ChecklistItem
                label="Protocole HTTPS"
                checked={form.step2.checklist.protocol_https}
                onChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    step2: {
                      ...current.step2,
                      checklist: { ...current.step2.checklist, protocol_https: checked },
                    },
                  }))
                }
              />
              <ChecklistItem
                label="Résolution DNS"
                checked={form.step2.checklist.dns}
                onChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    step2: {
                      ...current.step2,
                      checklist: { ...current.step2.checklist, dns: checked },
                    },
                  }))
                }
              />
              <ChecklistItem
                label="Accessibilité"
                checked={form.step2.checklist.accesibilite_ok}
                onChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    step2: {
                      ...current.step2,
                      checklist: { ...current.step2.checklist, accesibilite_ok: checked },
                    },
                  }))
                }
              />
            </div>
          </div>
        </section>
      )}

      {form.step === "recap" && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Récapitulatif</span>
          </div>
          <div className="panel-body stack">
            <div className="field-grid">
              <ReadOnlyField label="Nom" value={form.step1.name || "Non renseigné"} />
              <ReadOnlyField label="Type" value={form.step1.type} />
              <ReadOnlyField label="URL de base" value={form.step1.base_url || "Non renseignée"} />
              <ReadOnlyField
                label="Domaines autorisés"
                value={form.step2.allowed_hosts.join(", ") || "Non définis"}
              />
            </div>
            <p className="cell-muted">
              Aucune source ne sera créée : le registre des sources n’est pas exposé par le moteur.
            </p>
          </div>
        </section>
      )}

      <div className="cell-actions" style={{ marginTop: 18 }}>
        <button
          className="button button--secondary"
          disabled={stepIndex === 0}
          onClick={() => goToStep(STEPS[Math.max(stepIndex - 1, 0)])}
        >
          Précédent
        </button>
        <button
          className="button button--primary"
          disabled={stepIndex === STEPS.length - 1}
          onClick={() => goToStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)])}
        >
          Suivant
        </button>
      </div>
    </>
  );
}

function ChecklistItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="field" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <input
        className="checkbox"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <span>{value}</span>
    </div>
  );
}
