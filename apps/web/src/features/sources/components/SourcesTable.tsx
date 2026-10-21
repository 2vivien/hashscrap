import type { Source } from "../types/source.types";

export interface SourcesTableProps {
  sources: Source[];
}

const TYPE_LABELS: Record<Source["type"], string> = {
  website: "Site web",
  api: "API",
  network: "Réseau",
};

export function SourcesTable({ sources }: SourcesTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Domaines autorisés</th>
            <th>URL de base</th>
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id}>
              <td className="cell-mono">{source.id}</td>
              <td>{source.name}</td>
              <td className="cell-muted">{TYPE_LABELS[source.type]}</td>
              <td>
                <span className={`badge ${source.enabled ? "badge--green" : "badge"}`}>
                  {source.enabled ? "Activée" : "Désactivée"}
                </span>
              </td>
              <td className="cell-muted">{source.allowed_hosts.join(", ")}</td>
              <td className="cell-mono">{source.base_url}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
