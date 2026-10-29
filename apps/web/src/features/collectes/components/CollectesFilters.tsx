import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { COLLECTE_STATUS_LABEL, COLLECTE_TYPE_LABEL, type CollecteFilters, type CollecteStatus, type CollecteType } from "../types/collectes.types";

export interface CollectesFiltersProps { filters: CollecteFilters; onChange: (filters: CollecteFilters) => void; }
const STATUSES: CollecteStatus[] = ["en_cours", "terminee", "echouee", "annulee", "en_attente"];
const TYPES: CollecteType[] = ["web", "api", "reseau"];

export function CollectesFilters({ filters, onChange }: CollectesFiltersProps) {
  return <div className="mb-4 flex flex-wrap items-center gap-2.5">
    <div className="min-w-[220px] flex-1"><Input value={filters.search} onChange={(event) => onChange({ ...filters, search: event.target.value })} placeholder="Rechercher par ID ou source…" /></div>
    <Select value={filters.type} onValueChange={(value) => onChange({ ...filters, type: value as CollecteType })}><SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les types</SelectItem>{TYPES.map((type) => <SelectItem key={type} value={type}>{COLLECTE_TYPE_LABEL[type]}</SelectItem>)}</SelectContent></Select>
    <Select value={filters.status} onValueChange={(value) => onChange({ ...filters, status: value as CollecteStatus })}><SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les statuts</SelectItem>{STATUSES.map((status) => <SelectItem key={status} value={status}>{COLLECTE_STATUS_LABEL[status]}</SelectItem>)}</SelectContent></Select>
    <Button variant="ghost" onClick={() => onChange({ search: "", status: "all", type: "all" })}>Réinitialiser</Button>
  </div>;
}
