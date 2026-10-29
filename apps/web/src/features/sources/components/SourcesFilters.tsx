import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  SOURCE_STATUS_LABEL,
  SOURCE_TYPE_LABEL,
  type SourceFilters,
  type SourceStatus,
  type SourceType,
} from "../types/sources.types";

export interface SourcesFiltersProps {
  filters: SourceFilters;
  onChange: (filters: SourceFilters) => void;
}

const TYPES: SourceType[] = ["web", "api", "reseau"];
const STATUSES: SourceStatus[] = ["validee", "en_attente", "erreur"];

export function SourcesFilters({ filters, onChange }: SourcesFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <Input
        className="w-[220px]"
        type="search"
        aria-label="Filtrer les sources"
        placeholder="Filtrer..."
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.currentTarget.value })}
      />
      <Select
        value={filters.type}
        onValueChange={(value) => onChange({ ...filters, type: value as SourceType })}
      >
        <SelectTrigger className="w-[150px]" aria-label="Filtrer par type">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les types</SelectItem>
          {TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {SOURCE_TYPE_LABEL[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.statut}
        onValueChange={(value) => onChange({ ...filters, statut: value as SourceStatus })}
      >
        <SelectTrigger className="w-[150px]" aria-label="Filtrer par statut">
          <SelectValue placeholder="Statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          {STATUSES.map((statut) => (
            <SelectItem key={statut} value={statut}>
              {SOURCE_STATUS_LABEL[statut]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" onClick={() => onChange({ search: "", type: "all", statut: "all" })}>
        Réinitialiser
      </Button>
    </div>
  );
}
