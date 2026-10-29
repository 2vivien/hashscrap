import { Badge } from "../../../components/ui/badge";
import {
  ENTITY_TYPE_LABEL,
  CONFIANCE_LEVEL_LABEL,
} from "../../entities/types/entities.types";
import type { EntityDetailResponse } from "../validators/entity-detail.schema";

interface EntityDetailHeaderProps {
  entity: EntityDetailResponse;
}

export function EntityDetailHeader({ entity }: EntityDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink">{entity.valeur}</h1>
        <Badge variant={getTypeBadgeVariant(entity.type)}>{ENTITY_TYPE_LABEL[entity.type]}</Badge>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-secondary">Confiance:</span>
          <Badge variant={getConfianceBadgeVariant(entity.confiance)}>
            {CONFIANCE_LEVEL_LABEL[entity.confiance]}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-secondary">Observations:</span>
          <span className="text-[12px] text-ink">{entity.observations}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-secondary">Dernière détection:</span>
          <span className="text-[12px] text-ink">{new Date(entity.derniere_detection).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function getTypeBadgeVariant(type: string): string {
  switch (type) {
    case "email": return "lime";
    case "domaine": return "blue";
    case "ip": return "orange";
    case "personne": return "green";
    case "telephone": return "cyan";
    case "hash": return "yellow";
    default: return "neutral";
  }
}

function getConfianceBadgeVariant(confiance: string): string {
  switch (confiance) {
    case "elevee": return "green";
    case "moyenne": return "yellow";
    case "faible": return "red";
    default: return "neutral";
  }
}