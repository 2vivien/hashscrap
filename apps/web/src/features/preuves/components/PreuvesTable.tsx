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
import { formatBytes, formatDateTime, truncateHash } from "../../../lib/format";
import { PreuveStatusBadge } from "./PreuveStatusBadge";
import { type Preuve } from "../types/preuves.types";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Preuve>();

const columns = helper.columns([
  helper.accessor("apercu_url", {
    header: "Aperçu",
    cell: ({ row }) => (
      <a href={row.original.apercu_url} target="_blank" rel="noopener noreferrer">
        Voir
      </a>
    ),
  }),
  helper.accessor("url", {
    header: "URL",
    cell: ({ row }) => (
      <a href={row.original.url} target="_blank" rel="noopener noreferrer">
        {row.original.url}
      </a>
    ),
  }),
  helper.accessor("source", { header: "Source" }),
  helper.accessor("collectee_le", {
    header: "Collectée le",
    cell: ({ row }) => formatDateTime(row.original.collectee_le),
  }),
  helper.accessor("sha256", {
    header: "SHA-256",
    cell: ({ row }) => <span className="mono">{truncateHash(row.original.sha256)}</span>,
  }),
  helper.accessor("taille", {
    header: "Taille",
    cell: ({ row }) => <span className="text-ink-secondary">{formatBytes(row.original.taille)}</span>,
  }),
  helper.accessor("statut", {
    header: "Statut",
    cell: ({ row }) => <PreuveStatusBadge statut={row.original.statut} />,
  }),
]);

export interface PreuvesTableProps {
  preuves: Preuve[];
}

export function PreuvesTable({ preuves }: PreuvesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: preuves,
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
