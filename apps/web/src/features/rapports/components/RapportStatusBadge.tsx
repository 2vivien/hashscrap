import { Badge } from "../../../components/ui/badge";
import { RAPPORT_STATUS_LABEL, type RapportStatus } from "../types/rapports.types";

export interface RapportStatusBadgeProps {
  statut: RapportStatus;
}

export function RapportStatusBadge({ statut }: RapportStatusBadgeProps) {
  const variant = {
    validee: "green",
    en_attente: "yellow",
  }[statut];

  return <Badge variant={variant}>{RAPPORT_STATUS_LABEL[statut]}</Badge>;
}
