import type { Collecte, CollecteStatus } from "../types/collecte.types";

export interface CollecteTableProps {
  collectes: Collecte[];
}

const TONES: Record<CollecteStatus, string> = {
  en_cours: "badge--lime",
  terminee: "badge--green",
  echouee: "badge--red",
  annulee: "badge",
};

const LABELS: Record<CollecteStatus, string> = {
  en_cours: "En cours",
  terminee: "Terminée",
  echouee: "Échouée",
  annulee: "Annulée",
};

export function CollecteTable({ collectes }: CollecteTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Source</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Progression</th>
            <th>Pages</th>
          </tr>
        </thead>
        <tbody>
          {collectes.map((collecte) => (
            <tr key={collecte.id}>
              <td className="cell-mono">{collecte.id}</td>
              <td>{collecte.source}</td>
              <td className="cell-muted">{collecte.type}</td>
              <td>
                <span className={`badge ${TONES[collecte.statut]}`}>
                  {LABELS[collecte.statut]}
                </span>
              </td>
              <td>
                <div className="progress">
                  <span style={{ width: `${collecte.progression}%` }} />
                </div>
                <span className="cell-muted">{collecte.progression}%</span>
              </td>
              <td className="cell-muted">
                {collecte.pages.collecte}/{collecte.pages.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
