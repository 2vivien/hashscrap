import { useState } from "react";
import { DemoBanner } from "../../components/ui/DemoBanner";
import { useEntityDetail } from "./api/entity-detail.queries";
import type { EntityDetailTab } from "./types/entity-detail.types";

const TABS: EntityDetailTab[] = ["aperçu", "observations", "sources", "relations", "historique"];

const DEMO_ENTITY_ID = "ent-2025-04-001";

export function EntityDetailPage() {
  const [activeTab, setActiveTab] = useState<EntityDetailTab>("aperçu");
  const { data, isLoading } = useEntityDetail(DEMO_ENTITY_ID);

  if (isLoading || !data) {
    return <p className="cell-muted">Chargement du détail de l’entité…</p>;
  }

  const { entity, observations, relations, sourceIds } = data;

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ANALYSE / CORRÉLATION</p>
          <h1>{entity.raw_identifier}</h1>
          <p className="page-description">
            Identifiant normalisé <code className="cell-mono">{entity.normalized_identifier}</code>{" "}
            par <code className="cell-mono">{entity.normalization_method}</code>.
          </p>
        </div>
      </div>

      <DemoBanner message="Cette fiche est fictive : la corrélation exacte n’est pas encore exposée par le moteur." />

      <div className="tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`tab ${activeTab === tab ? "tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "aperçu" && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Informations générales</span>
            <span className="badge badge--green">{entity.review_status}</span>
          </div>
          <div className="panel-body field-grid">
            <div className="field">
              <span className="field-label">Type</span>
              <span>{entity.entity_type}</span>
            </div>
            <div className="field">
              <span className="field-label">Identifiant</span>
              <span>{entity.raw_identifier}</span>
            </div>
            <div className="field">
              <span className="field-label">Normalisé</span>
              <span className="cell-mono">{entity.normalized_identifier}</span>
            </div>
            <div className="field">
              <span className="field-label">Méthode de normalisation</span>
              <span className="cell-mono">{entity.normalization_method}</span>
            </div>
            <div className="field">
              <span className="field-label">Créé le</span>
              <span className="cell-muted">{entity.created_at}</span>
            </div>
          </div>
        </section>
      )}

      {activeTab === "observations" && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Champ</th>
                <th>Valeur brute</th>
                <th>Normalisée</th>
                <th>Extracteur</th>
                <th>Preuve</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((observation) => (
                <tr key={observation.id}>
                  <td>{observation.champ}</td>
                  <td>{observation.valeur_brute}</td>
                  <td className="cell-muted">{observation.valeur_normalisee}</td>
                  <td className="cell-muted">
                    {observation.extracteur} v{observation.version_extracteur}
                  </td>
                  <td className="cell-mono">{observation.evidence_ref}</td>
                  <td>
                    <span
                      className={`badge ${
                        observation.validation_status === "validated" ? "badge--green" : "badge"
                      }`}
                    >
                      {observation.validation_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "sources" && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Sources de référence</span>
          </div>
          <div className="panel-body" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {sourceIds.map((sourceId) => (
              <span key={sourceId} className="badge badge--lime">
                {sourceId}
              </span>
            ))}
          </div>
        </section>
      )}

      {activeTab === "relations" && (
        <div className="stack">
          {relations.map((relation) => (
            <div key={relation.id} className="panel">
              <div className="panel-body" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="badge badge--lime">{relation.source}</span>
                <span aria-hidden="true">→</span>
                <span className="badge badge--blue">{relation.target}</span>
                <span className="cell-muted">({relation.type})</span>
                <span className="badge badge--amber">{relation.review_status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "historique" && (
        <section className="panel">
          <div className="panel-header">
            <span className="panel-title">Historique</span>
          </div>
          <div className="panel-body stack">
            <div className="field">
              <span className="field-label">Créé le</span>
              <span className="cell-muted">{entity.created_at}</span>
            </div>
            <div className="field">
              <span className="field-label">Dernière mise à jour</span>
              <span className="cell-muted">{entity.created_at}</span>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
