import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import type { ObservationPayload } from "../validators/entity-detail.schema";

export interface ObservationsTableProps {
  observations: ObservationPayload[];
}

export function ObservationsTable({ observations }: ObservationsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Champ</TableHead>
          <TableHead>Valeur brute</TableHead>
          <TableHead>Normalisée</TableHead>
          <TableHead>Extracteur</TableHead>
          <TableHead>Validation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {observations.map((observation) => (
          <TableRow key={observation.id}>
            <TableCell>{observation.champ}</TableCell>
            <TableCell className="text-ink-secondary">{observation.valeur_brute}</TableCell>
            <TableCell>{observation.valeur_normalisee}</TableCell>
            <TableCell className="text-ink-secondary">
              {observation.extracteur} v{observation.version_extracteur}
            </TableCell>
            <TableCell>
              <span className="mono text-[11px] text-ink-muted">{observation.evidence_ref}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
