import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import type { ChronologieFilters } from "../types/chronologie.types";

interface ChronologieFiltersProps {
  filters: ChronologieFilters;
  onChange: (filters: ChronologieFilters) => void;
}

export function ChronologieFilters({ filters, onChange }: ChronologieFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ChronologieFilters>(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="startDate">Date de début</Label>
        <div className="relative">
          <Input
            id="startDate"
            type="date"
            value={localFilters.startDate}
            onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}          />
          <Calendar className="absolute right-3 top-2.5 size-4 text-ink-muted" />
        </div>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="endDate">Date de fin</Label>
        <div className="relative">
          <Input
            id="endDate"
            type="date"
            value={localFilters.endDate}
            onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}          />
          <Calendar className="absolute right-3 top-2.5 size-4 text-ink-muted" />
        </div>
      </div>

      <Button type="submit" variant="primary">
        Appliquer
      </Button>
    </form>
  );
}