import { DemoBanner } from "../../components/ui/DemoBanner";
import { useInvestigations } from "./api/investigation.queries";
import type { InvestigationStatus } from "./types/investigation.types";

const STATUS_LABELS: Record<InvestigationStatus, string> = {
  en_cours: "En cours",
  en_pause: "En pause",
  terminee: "Terminée",
};

const STATUS_TONES: Record<InvestigationStatus, string> = {
  en_cours: "badge--lime",
  en_pause: "badge--amber",
  terminee: "badge--green",
};

export function InvestigationsPage() {
  const { data: investigations = [], isLoading } = useInvestigations();

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ESPACE DE TRAVAIL / DOSSIERS</p>
          <h1>Investigations</h1>
          <p className="page-description">
            Organisez vos objectifs de recherche et leurs sources.
          </p>
        </div>
        <button
          className="button button--primary"
          disabled
          title="Disponible lorsque l’API de création d’investigation sera exposée"
        >
          <span aria-hidden="true">＋</span> Nouvelle investigation
        </button>
      </div>

      <DemoBanner message="Les dossiers ci-dessous sont fictifs : les investigations ne sont pas encore persistées par le moteur." />

      {isLoading ? (
        <p className="cell-muted">Chargement des investigations…</p>
      ) : investigations.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">◎</div>
          <h2>Aucune investigation</h2>
          <p>Créez un dossier pour regrouper sources, collectes et preuves.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Sources</th>
                <th>Observations</th>
                <th>Dernière activité</th>
              </tr>
            </thead>
            <tbody>
              {investigations.map((investigation) => (
                <tr key={investigation.id}>
                  <td className="cell-mono">{investigation.id}</td>
                  <td>{investigation.name}</td>
                  <td className="cell-muted">{investigation.description}</td>
                  <td>
                    <span className={`badge ${STATUS_TONES[investigation.statut]}`}>
                      {STATUS_LABELS[investigation.statut]}
                    </span>
                  </td>
                  <td className="cell-muted">{investigation.sources.length}</td>
                  <td className="cell-muted">{investigation.observations.length}</td>
                  <td className="cell-muted">{investigation.derniere_activité}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
