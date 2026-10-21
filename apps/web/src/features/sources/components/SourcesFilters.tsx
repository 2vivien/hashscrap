import type { SourceFilters, SourceType } from "../types/source.types";

export interface SourcesFiltersProps {
  filters: SourceFilters;
  onChange: (filters: SourceFilters) => void;
}

const TYPES: SourceType[] = ["website", "api", "network"];

export function SourcesFilters({ filters, onChange }: SourcesFiltersProps) {
  return (
    <div className="toolbar">
      <div className="field" style={{ minWidth: "220px", flex: "1 1 220px" }}>
        <label className="field-label" htmlFor="sources-search">
          Recherche
        </label>
        <input
          id="sources-search"
          className="input"
          type="search"
          value={filters.search ?? ""}
          placeholder="Rechercher par nom ou domaine…"
          onChange={(event) => onChange({ ...filters, search: event.currentTarget.value })}
        />
      </div>
      <div className="field" style={{ minWidth: "150px" }}>
        <label className="field-label" htmlFor="sources-statut">
          Statut
        </label>
        <select
          id="sources-statut"
          className="select"
          value={filters.enabled === undefined ? "" : String(filters.enabled)}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange({ ...filters, enabled: value === "" ? undefined : value === "true" });
          }}
        >
          <option value="">Tous</option>
          <option value="true">Activée</option>
          <option value="false">Désactivée</option>
        </select>
      </div>
      <div className="field" style={{ minWidth: "150px" }}>
        <label className="field-label" htmlFor="sources-type">
          Type
        </label>
        <select
          id="sources-type"
          className="select"
          value={filters.type ?? ""}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange({ ...filters, type: value === "" ? undefined : (value as SourceType) });
          }}
        >
          <option value="">Tous</option>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
