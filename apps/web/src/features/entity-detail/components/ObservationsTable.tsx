import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import type { ObservationPayload } from "../validators/entity-detail.schema";

export interface ObservationsTableProps { observations: ObservationPayload[]; }
const STATUS_LABEL: Record<ObservationPayload["validation_status"], string> = { unreviewed: "À vérifier", validated: "Validée", rejected: "Rejetée" };
export function ObservationsTable({ observations }: ObservationsTableProps) {
  return <Table><TableHeader><TableRow><TableHead>Champ</TableHead><TableHead>Valeur brute</TableHead><TableHead>Normalisée</TableHead><TableHead>Extracteur</TableHead><TableHead>Référence preuve</TableHead><TableHead>Validation</TableHead></TableRow></TableHeader>
    <TableBody>{observations.map((observation) => <TableRow key={observation.id}>
      <TableCell>{observation.champ}</TableCell><TableCell className="text-ink-secondary">{observation.valeur_brute}</TableCell><TableCell>{observation.valeur_normalisee}</TableCell><TableCell className="text-ink-secondary">{observation.extracteur} v{observation.version_extracteur}</TableCell><TableCell><span className="mono text-[11px] text-ink-muted">{observation.evidence_ref}</span></TableCell><TableCell><Badge variant={observation.validation_status === "validated" ? "green" : observation.validation_status === "rejected" ? "red" : "neutral"}>{STATUS_LABEL[observation.validation_status]}</Badge></TableCell>
    </TableRow>)}</TableBody>
  </Table>;
}
