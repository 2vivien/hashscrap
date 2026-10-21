import type { CollecteFilters, CollecteStatus, CollecteType } from "../types/collecte.types";

export interface CollectesFiltersProps {
  filters: CollecteFilters;
  onChange: (filters: CollecteFilters) => void;
}

const STATUTS: CollecteStatus[] = ["en_cours", "terminee", "echouee", "annulee"];
const TYPES: CollecteType[] = ["Web", "Réseau", "API"];

export function CollectesFilters({ filters, onChange }: CollectesFiltersProps) {
  return (
    <div className="toolbar">
      <div className="field" style={{ minWidth: "220px", flex: "1 1 220px" }}>
        <label className="field-label" htmlFor="collectes-search">
          Recherche
        </label>
        <input
          id="collectes-search"
          className="input"
          type="search"
          value={filters.search ?? ""}
          placeholder="Rechercher par source ou ID…"
          onChange={(event) => onChange({ ...filters, search: event.currentTarget.value })}
        />
      </div>
      <div className="field" style={{ minWidth: "160px" }}>
        <label className="field-label" htmlFor="collectes-statut">
          Statut
        </label>
        <select
          id="collectes-statut"
          className="select"
          value={filters.statut ?? ""}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange({
              ...filters,
              statut: value === "" ? undefined : (value as CollecteStatus),
            });
          }}
        >
          <option value="">Tous</option>
          {STATUTS.map((statut) => (
            <option key={statut} value={statut}>
              {statut}
            </option>
          ))}
        </select>
      </div>
      <div className="field" style={{ minWidth: "140px" }}>
        <label className="field-label" htmlFor="collectes-type">
          Type
        </label>
        <select
          id="collectes-type"
          className="select"
          value={filters.type ?? ""}
          onChange={(event) => {
            const value = event.currentTarget.value;
            onChange({ ...filters, type: value === "" ? undefined : (value as CollecteType) });
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
