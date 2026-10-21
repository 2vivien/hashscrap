import { Badge } from "../../../components/ui/badge";
import { COLLECTE_STATUS_LABEL, type CollecteStatus } from "../types/collectes.types";

const TONE: Record<CollecteStatus, "blue" | "green" | "red" | "neutral"> = {
  en_cours: "blue",
  terminee: "green",
  echouee: "red",
  annulee: "neutral",
};

export interface CollecteStatusBadgeProps {
  status: CollecteStatus;
}

export function CollecteStatusBadge({ status }: CollecteStatusBadgeProps) {
  return <Badge variant={TONE[status]}>{COLLECTE_STATUS_LABEL[status]}</Badge>;
}
