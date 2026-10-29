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
import { Badge } from "../../../components/ui/badge";
import { formatDateTime } from "../../../lib/format";
import { INVESTIGATION_STATUS_LABEL, type Investigation } from "../types/investigations.types";

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Investigation>();

const columns = helper.columns([
  helper.accessor("nom", { header: "Nom" }),
  helper.accessor("description", { header: "Description" }),
  helper.accessor("statut", {
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={row.original.statut === "en_cours" ? "blue" : row.original.statut === "terminee" ? "green" : "neutral"}>{
        INVESTIGATION_STATUS_LABEL[row.original.statut]
      }</Badge>
    ),
  }),
  helper.accessor("sources", { header: "Enquêtes" }),
  helper.accessor("observations", { header: "Observations" }),
  helper.accessor("derniere_activite", {
    header: "Dernière activité",
    cell: ({ row }) => formatDateTime(row.original.derniere_activite),
  }),
]);

interface InvestigationsTableProps {
  investigations: Investigation[];
}

export function InvestigationsTable({ investigations }: InvestigationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useTable({
    features,
    columns,
    data: investigations,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>{
            group.headers.map((header) => (
              <TableHead key={header.id} onClick={header.column.getToggleSortingHandler?.()}>{
                <table.FlexRender header={header} />
              }</TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>{
            row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>{
                <table.FlexRender cell={cell} />
              }</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}