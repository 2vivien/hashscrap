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
import { RapportStatusBadge } from "./RapportStatusBadge";
import { RapportFormatBadge } from "./RapportFormatBadge";
import { RapportActions } from "./RapportActions";
import { type Rapport } from "../types/rapports.types";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Rapport>();

const columns = helper.columns([
  helper.accessor("titre", { header: "Titre" }),
  helper.accessor("investigation", { header: "Investigation" }),
  helper.accessor("statut", {
    header: "Statut",
    cell: ({ row }) => <RapportStatusBadge statut={row.original.statut} />,
  }),
  helper.accessor("genere_le", {
    header: "Généré le",
    cell: ({ row }) => formatDateTime(row.original.genere_le),
  }),
  helper.accessor("format", {
    header: "Format",
    cell: ({ row }) => <RapportFormatBadge format={row.original.format} />,
  }),
  helper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <RapportActions rapport={row.original} />,
  }),
]);

export interface RapportsTableProps {
  rapports: Rapport[];
}

export function RapportsTable({ rapports }: RapportsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: rapports,
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
