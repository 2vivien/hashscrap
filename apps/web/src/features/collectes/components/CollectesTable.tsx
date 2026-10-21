import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { formatDateTime } from "../../../lib/format";
import { CollecteProgress } from "./CollecteProgress";
import { CollecteStatusBadge } from "./CollecteStatusBadge";
import { COLLECTE_TYPE_LABEL, type Collecte } from "../types/collectes.types";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Collecte>();

const columns = helper.columns([
  helper.accessor("id", {
    header: "ID",
    cell: ({ row }) => <span className="mono text-lime">{row.original.id}</span>,
  }),
  helper.accessor("source", { header: "Source" }),
  helper.accessor("type", {
    header: "Type",
    cell: ({ row }) => COLLECTE_TYPE_LABEL[row.original.type],
  }),
  helper.accessor("status", {
    header: "Statut",
    cell: ({ row }) => <CollecteStatusBadge status={row.original.status} />,
  }),
  helper.display({
    id: "progress",
    header: "Progression",
    cell: ({ row }) => <CollecteProgress collecte={row.original} />,
  }),
  helper.accessor("pages", { header: "Pages" }),
  helper.accessor("duration", { header: "Durée" }),
  helper.accessor("started_at", {
    header: "Démarré",
    cell: ({ row }) => formatDateTime(row.original.started_at),
  }),
]);

export interface CollectesTableProps {
  collectes: Collecte[];
}

export function CollectesTable({ collectes }: CollectesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: collectes,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              <TableHead key={header.id} onClick={header.column.getToggleSortingHandler?.()}>
                <table.FlexRender header={header} />
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
