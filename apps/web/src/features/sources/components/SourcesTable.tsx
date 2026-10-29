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
import { SourceStatusBadge } from "./SourceStatusBadge";
import { SOURCE_TYPE_LABEL, type Source } from "../types/sources.types";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Source>();

const columns = helper.columns([
  helper.accessor("nom", { header: "Nom" }),
  helper.accessor("url", {
    header: "URL",
    cell: ({ row }) => <span className="mono text-[12px] text-ink-secondary">{row.original.url}</span>,
  }),
  helper.accessor("type", {
    header: "Type",
    cell: ({ row }) => SOURCE_TYPE_LABEL[row.original.type],
  }),
  helper.accessor("statut", {
    header: "Statut",
    cell: ({ row }) => <SourceStatusBadge statut={row.original.statut} />,
  }),
  helper.accessor("derniere_collecte", {
    header: "Dernière collecte",
    cell: ({ row }) =>
      row.original.derniere_collecte ? formatDateTime(row.original.derniere_collecte) : "—",
  }),
  helper.accessor("domaines", {
    header: "Domaines",
    cell: ({ row }) => (
      <span className="text-[12px] text-ink-secondary">{row.original.domaines.join(", ")}</span>
    ),
  }),
]);

export interface SourcesTableProps {
  sources: Source[];
}

export function SourcesTable({ sources }: SourcesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: sources,
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
