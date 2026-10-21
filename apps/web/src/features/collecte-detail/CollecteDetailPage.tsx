import { DemoBanner } from "../../components/ui/DemoBanner";
import { useCollecteDetail } from "./api/collecte-detail.queries";

export interface CollecteDetailPageProps {
  id: string;
}

export function CollecteDetailPage({ id }: CollecteDetailPageProps) {
  const { data: collecte, isLoading } = useCollecteDetail(id);

  if (isLoading || !collecte) {
    return <p className="cell-muted">Chargement du détail de la collecte…</p>;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">EXÉCUTION / TÂCHES</p>
          <h1>{collecte.id}</h1>
          <p className="page-description">
            Source {collecte.source} · type {collecte.type} · démarrée le {collecte.demarre}
          </p>
        </div>
        <button
          className="button button--secondary"
          disabled
          title="Disponible lorsque l’API de relance de collecte sera exposée"
        >
          Relancer
        </button>
      </div>

      <DemoBanner message="Cette collecte est fictive : les journaux de collecte ne sont pas encore exposés par le moteur." />

      <div className="field-grid" style={{ marginBottom: 18 }}>
        <section className="panel">
          <div className="panel-body">
            <span className="field-label">Progression</span>
            <p style={{ fontSize: 26, fontWeight: 600 }}>{collecte.progression}%</p>
            <div className="progress progress--running">
              <span style={{ width: `${collecte.progression}%` }} />
            </div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-body">
            <span className="field-label">Pages collectées</span>
            <p style={{ fontSize: 26, fontWeight: 600 }}>
              {collecte.pages.collecte}/{collecte.pages.total}
            </p>
            <p className="cell-muted">Durée {collecte.duree}</p>
          </div>
        </section>
        <section className="panel">
          <div className="panel-body">
            <span className="field-label">Observations</span>
            <p style={{ fontSize: 26, fontWeight: 600 }}>{collecte.observations.total}</p>
            <p className="cell-muted">
              {collecte.observations.validated} validées · {collecte.observations.rejected}{" "}
              rejetées
            </p>
          </div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-header">
          <span className="panel-title">Erreurs de collecte</span>
          <span className="badge badge--red">{collecte.erreurs.length}</span>
        </div>
        <div className="panel-body stack">
          {collecte.erreurs.map((erreur) => (
            <div key={erreur.code} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="badge badge--red">{erreur.type}</span>
              <div>
                <p>{erreur.message}</p>
                <p className="cell-muted">
                  <span className="cell-mono">{erreur.code}</span> · {erreur.compteur} occurrence(s)
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
