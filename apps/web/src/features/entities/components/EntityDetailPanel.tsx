import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import { useEntityDetail } from "../../entity-detail/hooks/useEntityDetail";
import {
  ENTITY_TYPE_LABEL,
  CONFIANCE_LEVEL_LABEL,
} from "../types/entities.types";

interface EntityDetailPanelProps {
  entityId: string | null;
}

export function EntityDetailPanel({ entityId }: EntityDetailPanelProps) {
  const [showPanel, setShowPanel] = useState(false);
  const { data, isPending, isError, refetch } = useEntityDetail(entityId ?? "");

  useEffect(() => {
    if (entityId) {
      setShowPanel(true);
      void refetch();
    } else {
      setShowPanel(false);
    }
  }, [entityId, refetch]);

  if (!showPanel) return null;

  if (isPending) {
    return (
      <Card className="h-[calc(100vh-120px)]">
        <CardHeader>
          <CardTitle>Détail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="h-[calc(100vh-120px)]">
        <CardHeader>
          <CardTitle>Détail</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-56px)]">
          <p className="text-ink-muted">Sélectionnez une entité pour voir les détails</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[calc(100vh-120px)]">
      <CardHeader>
        <CardTitle>Détail</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-[15px] font-medium text-ink">{data.valeur}</h3>
        <Badge variant={getTypeBadgeVariant(data.type)}>{ENTITY_TYPE_LABEL[data.type]}</Badge>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[12px] text-ink-secondary">Type</span>
            <span className="text-[12px] text-ink">{ENTITY_TYPE_LABEL[data.type]}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[12px] text-ink-secondary">Confiance</span>
            <Badge variant={getConfianceBadgeVariant(data.confiance)}>
              {CONFIANCE_LEVEL_LABEL[data.confiance]}
            </Badge>
          </div>

          <div className="flex justify-between">
            <span className="text-[12px] text-ink-secondary">Observations</span>
            <span className="text-[12px] text-ink">{data.observations}</span>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="mb-2 text-[13px] font-medium text-ink">Relations</h4>
          {data.relations.length > 0 ? (
            <ul className="space-y-2">
              {data.relations.map((relation) => (
                <li key={relation.id} className="text-[12px] text-ink">
                  {relation.libelle}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12px] text-ink-muted">Aucune relation détectée</p>
          )}
        </div>
      </CardContent>
    </Card>
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