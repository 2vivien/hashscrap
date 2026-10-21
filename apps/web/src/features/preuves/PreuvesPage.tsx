import { DemoBanner } from "../../components/ui/DemoBanner";
import { usePreuves } from "./api/preuves.queries";
import type { PreuveStatus } from "./types/preuves.types";

const STATUS_TONES: Record<PreuveStatus, string> = {
  validée: "badge--green",
  en_attente: "badge--amber",
  erreur: "badge--red",
};

export function PreuvesPage() {
  const { data: preuves = [], isLoading } = usePreuves();

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ANALYSE / PROVENANCE</p>
          <h1>Preuves</h1>
          <p className="page-description">
            Vérifiez l’origine, la date, l’empreinte et l’historique des observations.
          </p>
        </div>
      </div>

      <DemoBanner message="Les preuves ci-dessous sont fictives : les documents ne sont pas encore exposés par le moteur." />

      {isLoading ? (
        <p className="cell-muted">Chargement des preuves…</p>
      ) : preuves.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">▤</div>
          <h2>Aucune preuve</h2>
          <p>Les empreintes et les références de preuve apparaîtront après une collecte.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Aperçu</th>
                <th>Source</th>
                <th>Collectée le</th>
                <th>SHA-256</th>
                <th>Taille</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {preuves.map((preuve) => (
                <tr key={preuve.id}>
                  <td>
                    <a className="cell-mono" href={preuve.aperçu_url}>
                      {preuve.id}
                    </a>
                  </td>
                  <td>{preuve.source}</td>
                  <td className="cell-muted">{preuve.collectée_le}</td>
                  <td className="cell-mono">{preuve.sha256.slice(0, 16)}…</td>
                  <td className="cell-muted">{preuve.taille}</td>
                  <td>
                    <span className={`badge ${STATUS_TONES[preuve.statut]}`}>{preuve.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
