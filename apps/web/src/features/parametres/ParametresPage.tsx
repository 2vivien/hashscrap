import { useState } from "react";
import { DemoBanner } from "../../components/ui/DemoBanner";
import type { ParametresSection } from "./types/parametres.types";

const SECTIONS: Array<{ value: ParametresSection; label: string }> = [
  { value: "collecteur", label: "Collecteur" },
  { value: "reseau", label: "Réseau" },
  { value: "conservation", label: "Conservation" },
  { value: "securite", label: "Sécurité" },
  { value: "audit", label: "Audit" },
];

export function ParametresPage() {
  const [section, setSection] = useState<ParametresSection>("collecteur");

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION / CONFIGURATION</p>
          <h1>Paramètres</h1>
          <p className="page-description">
            Consultez les règles d’exploitation et les paramètres de sécurité.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          title="Disponible lorsqu’une API de paramètres validée et auditée sera exposée"
        >
          Enregistrer les paramètres
        </button>
      </div>

      <DemoBanner message="Les valeurs ci-dessous sont des valeurs d’exemple en lecture seule : les paramètres ne sont pas modifiables sans une API auditée." />

      <div className="tabs" role="tablist">
        {SECTIONS.map((item) => (
          <button
            key={item.value}
            role="tab"
            aria-selected={section === item.value}
            className={`tab ${section === item.value ? "tab--active" : ""}`}
            onClick={() => setSection(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">
            {SECTIONS.find((item) => item.value === section)?.label}
          </span>
          <span className="badge badge--amber">Lecture seule</span>
        </div>
        <div className="panel-body">
          {section === "collecteur" && (
            <div className="field-grid">
              <ReadOnlyField label="Pages max" value="500" />
              <ReadOnlyField label="Profondeur max" value="3" />
              <ReadOnlyField label="Timeout (s)" value="30" />
              <ReadOnlyField label="Concurrence" value="5" />
            </div>
          )}
          {section === "reseau" && (
            <div className="field-grid">
              <ReadOnlyField label="Périmètre" value="Internet" />
              <ReadOnlyField label="Restrictions" value="Aucune" />
            </div>
          )}
          {section === "conservation" && (
            <div className="field-grid">
              <ReadOnlyField label="Rétention observations (j)" value="365" />
              <ReadOnlyField label="Rétention preuves (j)" value="730" />
              <ReadOnlyField label="Rétention rapports (j)" value="1095" />
            </div>
          )}
          {section === "securite" && (
            <div className="field-grid">
              <ReadOnlyField label="Journalisation d’audit" value="Activée" />
              <ReadOnlyField label="Authentification requise" value="Désactivée" />
            </div>
          )}
          {section === "audit" && (
            <div className="field-grid">
              <ReadOnlyField label="Logs détaillés" value="Activer" />
              <ReadOnlyField label="Conservation logs (j)" value="90" />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <span className="cell-mono">{value}</span>
    </div>
  );
}
