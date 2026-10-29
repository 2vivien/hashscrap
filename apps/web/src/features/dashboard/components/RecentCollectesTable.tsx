import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { CollecteProgress } from "../../collectes/components/CollecteProgress";
import { CollecteStatusBadge } from "../../collectes/components/CollecteStatusBadge";
import { COLLECTE_TYPE_LABEL, type Collecte } from "../../collectes/types/collectes.types";
import { formatDateTime } from "../../../lib/format";

export interface RecentCollectesTableProps { collectes: Collecte[]; }
export function RecentCollectesTable({ collectes }: RecentCollectesTableProps) {
  return <Card><CardHeader><CardTitle>Collectes récentes</CardTitle></CardHeader><CardContent className="p-0">
    <Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Source</TableHead><TableHead>Type</TableHead><TableHead>Statut</TableHead><TableHead>Progression</TableHead><TableHead>Pages</TableHead><TableHead>Démarré</TableHead></TableRow></TableHeader>
      <TableBody>{collectes.map((collecte) => <TableRow key={collecte.id}>
        <TableCell className="mono"><Link to="/collectes/$id" params={{ id: collecte.id }} className="text-lime hover:underline">{collecte.id}</Link></TableCell>
        <TableCell>{collecte.source}</TableCell><TableCell className="text-ink-secondary">{COLLECTE_TYPE_LABEL[collecte.type]}</TableCell><TableCell><CollecteStatusBadge status={collecte.status} /></TableCell><TableCell><CollecteProgress collecte={collecte} /></TableCell><TableCell className="text-ink-secondary">{collecte.pages}</TableCell><TableCell className="text-ink-secondary">{formatDateTime(collecte.started_at)}</TableCell>
      </TableRow>)}</TableBody>
    </Table>
  </CardContent></Card>;
}
