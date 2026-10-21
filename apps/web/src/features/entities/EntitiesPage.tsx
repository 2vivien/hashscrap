import { Link } from "@tanstack/react-router";
import { DemoBanner } from "../../components/ui/DemoBanner";
import { useEntities } from "./api/entity.queries";
import type { Entity } from "./types/entity.types";

const REVIEW_LABELS: Record<Entity["review_status"], string> = {
  unreviewed: "Non examiné",
  accepted_exact: "Correspondance exacte",
  needs_review: "À examiner",
  rejected: "Rejeté",
};

const REVIEW_TONES: Record<Entity["review_status"], string> = {
  unreviewed: "badge",
  accepted_exact: "badge--green",
  needs_review: "badge--amber",
  rejected: "badge--red",
};

export function EntitiesPage() {
  const { data: entities = [], isLoading } = useEntities();

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">ANALYSE / CORRÉLATION</p>
          <h1>Entités &amp; relations</h1>
          <p className="page-description">
            Explorez les identifiants rapprochés et les relations justifiées par des preuves.
          </p>
        </div>
      </div>

      <DemoBanner message="Les entités ci-dessous sont fictives : la corrélation exacte n’est pas encore exposée par le moteur." />

      {isLoading ? (
        <p className="cell-muted">Chargement des entités…</p>
      ) : entities.length === 0 ? (
        <div className="empty-panel empty-panel--compact">
          <div className="empty-symbol" aria-hidden="true">◇</div>
          <h2>Aucune entité</h2>
          <p>Les entités apparaîtront ici après une collecte correlée.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Identifiant</th>
                <th>Normalisé</th>
                <th>Méthode</th>
                <th>Statut d’examen</th>
                <th>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.id}>
                  <td className="cell-mono">{entity.id}</td>
                  <td className="cell-muted">{entity.entity_type}</td>
                  <td>
                    <Link to="/entities/$id" params={{ id: entity.id }}>
                      {entity.raw_identifier}
                    </Link>
                  </td>
                  <td className="cell-mono">{entity.normalized_identifier}</td>
                  <td className="cell-muted">{entity.normalization_method}</td>
                  <td>
                    <span className={`badge ${REVIEW_TONES[entity.review_status]}`}>
                      {REVIEW_LABELS[entity.review_status]}
                    </span>
                  </td>
                  <td className="cell-muted">{entity.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
