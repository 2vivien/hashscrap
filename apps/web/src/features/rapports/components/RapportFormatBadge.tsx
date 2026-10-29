import { Badge } from "../../../components/ui/badge";
import { RAPPORT_FORMAT_LABEL, type RapportFormat } from "../types/rapports.types";

export interface RapportFormatBadgeProps {
  format: RapportFormat;
}

export function RapportFormatBadge({ format }: RapportFormatBadgeProps) {
  const variant = {
    pdf: "blue",
    markdown: "green",
    json: "orange",
  }[format];

  return <Badge variant={variant}>{RAPPORT_FORMAT_LABEL[format]}</Badge>;
}
