import { Badge } from "../../../components/ui/badge";
import { PREUVE_STATUS_LABEL, type PreuveStatus } from "../types/preuves.types";

export interface PreuveStatusBadgeProps {
  statut: PreuveStatus;
}

const VARIANT: Record<PreuveStatus, string> = {
  validee: "green",
  en_attente: "yellow",
  erreur: "red",
};

export function PreuveStatusBadge({ statut }: PreuveStatusBadgeProps) {
  return <Badge variant={VARIANT[statut]}>{PREUVE_STATUS_LABEL[statut]}</Badge>;
}
