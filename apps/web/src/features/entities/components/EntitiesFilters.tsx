import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  ENTITY_TYPE_LABEL,
  CONFIANCE_LEVEL_LABEL,
  type EntityFilters,
} from "../types/entities.types";

interface EntitiesFiltersProps {
  filters: EntityFilters;
  onChange: (filters: EntityFilters) => void;
}

export function EntitiesFilters({ filters, onChange }: EntitiesFiltersProps) {
  const [localFilters, setLocalFilters] = useState<EntityFilters>(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localFilters);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[300px]">
        <Label htmlFor="search">Rechercher</Label>
        <div className="relative">
          <Input
            id="search"
            placeholder="Email, domaine, IP..."
            value={localFilters.search}
            onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}          />
          <Search className="absolute right-3 top-2.5 size-4 text-ink-muted" />
        </div>
      </div>

      <div className="w-[180px]">
        <Label htmlFor="type">Type</Label>
        <Select
          value={localFilters.type}
          onValueChange={(value) => setLocalFilters({ ...localFilters, type: value as EntityFilters["type"] })}        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Tous les types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(ENTITY_TYPE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-[180px]">
        <Label htmlFor="confiance">Confiance</Label>
        <Select
          value={localFilters.confiance}
          onValueChange={(value) => setLocalFilters({ ...localFilters, confiance: value as EntityFilters["confiance"] })}        >
          <SelectTrigger id="confiance">
            <SelectValue placeholder="Toute confiance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toute confiance</SelectItem>
            {Object.entries(CONFIANCE_LEVEL_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" variant="primary">
        Appliquer
      </Button>
    </form>
  );
}