import { DemoBanner } from "../../components/ui/DemoBanner";
import { useRapports } from "./api/rapports.queries";
import type { RapportStatus } from "./types/rapports.types";

const STATUS_TONES: Record<RapportStatus, string> = {
  brouillon: "badge",
  validé: "badge--green",
  exporté: "badge--blue",
};

export function RapportsPage() {
  const { data: rapports = [], isLoading } = useRapports();

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LIVRABLES / EXPORTS</p>
          <h1>Rapports</h1>
          <p className="page-description">
            Produisez des rapports reproductibles, sourcés et transparents sur les limites.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          title="Disponible lorsque l’API de génération de rapport sera exposée"
        >
          <span aria-hidden="true">＋</span> Générer un rapport
        </button>
      </div>

      <DemoBanner message="Les rapports ci-dessous sont fictifs : la génération de rapport n’est pas encore exposée par le moteur." />

      {isLoading ? (
        <p className="cell-muted">Chargement des rapports…</p>
      ) : rapports.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">▧</div>
          <h2>Aucun rapport</h2>
          <p>Un rapport sourcé sera produit à partir des observations validées.</p>
        </div>
      ) : (
        <div className="stack">
          {rapports.map((rapport) => (
            <article key={rapport.id} className="panel">
              <div className="panel-header">
                <span className="panel-title">{rapport.titre}</span>
                <span className={`badge ${STATUS_TONES[rapport.statut]}`}>{rapport.statut}</span>
              </div>
              <div className="panel-body stack">
                <p className="cell-muted">
                  Enquête <span className="cell-mono">{rapport.investigation}</span> · généré le{" "}
                  {rapport.généré_le} · format {rapport.format}
                </p>
                <pre
                  className="cell-mono"
                  style={{ margin: 0, whiteSpace: "pre-wrap", color: "#c9d5e0" }}
                >
                  {rapport.contenu_md}
                </pre>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
