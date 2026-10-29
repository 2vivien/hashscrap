import { Badge } from "../../../components/ui/badge";
import { SOURCE_STATUS_LABEL, type SourceStatus } from "../types/sources.types";

const TONE: Record<SourceStatus, "green" | "amber" | "red"> = {
  validee: "green",
  en_attente: "amber",
  erreur: "red",
};

export interface SourceStatusBadgeProps {
  statut: SourceStatus;
}

export function SourceStatusBadge({ statut }: SourceStatusBadgeProps) {
  return <Badge variant={TONE[statut]}>{SOURCE_STATUS_LABEL[statut]}</Badge>;
}
