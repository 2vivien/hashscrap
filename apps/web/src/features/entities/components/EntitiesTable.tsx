import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Link } from "@tanstack/react-router";
import { formatDateTime } from "../../../lib/format";
import {
  ENTITY_TYPE_LABEL,
  CONFIANCE_LEVEL_LABEL,
  type Entity,
} from "../types/entities.types";

export interface EntitiesTableProps {
  entities: Entity[];
  onSelectEntity: (id: string) => void;
}

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});

const helper = createColumnHelper<typeof features, Entity>();

const buildColumns = (onSelectEntity: (id: string) => void) =>
  helper.columns([
  helper.accessor("valeur", {
    header: "Entité",
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => onSelectEntity(row.original.id)}
        className="text-lime hover:underline"
      >
        {row.original.valeur}
      </button>
    ),
  }),
  helper.accessor("type", {
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={getTypeBadgeVariant(row.original.type)}>
        {ENTITY_TYPE_LABEL[row.original.type]}
      </Badge>
    ),
  }),
  helper.accessor("observations", { header: "Observations" }),
  helper.accessor("confiance", {
    header: "Confiance",
    cell: ({ row }) => (
      <Badge variant={getConfianceBadgeVariant(row.original.confiance)}>
        {CONFIANCE_LEVEL_LABEL[row.original.confiance]}
      </Badge>
    ),
  }),
  helper.accessor("derniere_detection", {
    header: "Dernière détection",
    cell: ({ row }) => formatDateTime(row.original.derniere_detection),
  }),
  helper.display({
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link
        to="/entities/$id"
        params={{ id: row.original.id }}
        className="text-[12px] text-ink-secondary hover:text-ink"
      >
        Détail
      </Link>
    ),
  }),
  ]);

export function EntitiesTable({ entities, onSelectEntity }: EntitiesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo(() => buildColumns(onSelectEntity), [onSelectEntity]);
  const table = useTable({
    features,
    columns,
    data: entities,
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

function getTypeBadgeVariant(type: string): string {
  switch (type) {
    case "email": return "lime";
    case "domaine": return "blue";
    case "ip": return "orange";
    case "personne": return "green";
    case "telephone": return "cyan";
    case "hash": return "yellow";
    default: return "neutral";
  }
}

function getConfianceBadgeVariant(confiance: string): string {
  switch (confiance) {
    case "elevee": return "green";
    case "moyenne": return "yellow";
    case "faible": return "red";
    default: return "neutral";
  }
}