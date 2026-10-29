import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { EVENT_TYPE_LABEL, type ChronologieFilters, type EventType } from "../types/chronologie.types";

interface ChronologieFiltersProps { filters: ChronologieFilters; onChange: (filters: ChronologieFilters) => void; }
export function ChronologieFilters({ filters, onChange }: ChronologieFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ChronologieFilters>(filters);
  useEffect(() => setLocalFilters(filters), [filters]);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onChange(localFilters); }
  return <form onSubmit={submit} className="mb-6 flex flex-wrap items-end gap-4">
    <div className="min-w-[180px] flex-1 space-y-1.5"><Label htmlFor="startDate">Date de début</Label><div className="relative"><Input id="startDate" type="date" value={localFilters.startDate} onChange={(event) => setLocalFilters({ ...localFilters, startDate: event.target.value })} /><Calendar className="pointer-events-none absolute right-3 top-2.5 size-4 text-ink-muted" /></div></div>
    <div className="min-w-[180px] flex-1 space-y-1.5"><Label htmlFor="endDate">Date de fin</Label><div className="relative"><Input id="endDate" type="date" value={localFilters.endDate} onChange={(event) => setLocalFilters({ ...localFilters, endDate: event.target.value })} /><Calendar className="pointer-events-none absolute right-3 top-2.5 size-4 text-ink-muted" /></div></div>
    <div className="min-w-[180px] space-y-1.5"><Label>Type d’événement</Label><Select value={localFilters.type} onValueChange={(value) => setLocalFilters({ ...localFilters, type: value as EventType | "all" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les types</SelectItem>{(Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((type) => <SelectItem key={type} value={type}>{EVENT_TYPE_LABEL[type]}</SelectItem>)}</SelectContent></Select></div>
    <div className="flex gap-2"><Button type="submit" variant="primary">Appliquer</Button><Button type="button" variant="secondary" onClick={() => { const reset: ChronologieFilters = { startDate: "", endDate: "", type: "all" }; setLocalFilters(reset); onChange(reset); }}>Réinitialiser</Button></div>
  </form>;
}
