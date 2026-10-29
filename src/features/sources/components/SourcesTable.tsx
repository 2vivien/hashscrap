import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Source, STATUT_LABELS, TYPE_LABELS } from '../types/sources.types';

const columnHelper = createColumnHelper<Source>();

const columns = [
  columnHelper.accessor('nom', {
    header: 'NOM',
  }),
  columnHelper.accessor('url', {
    header: 'URL',
    cell: (info) => (
      <a href={info.getValue()} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor('type', {
    header: 'TYPE',
    cell: (info) => TYPE_LABELS[info.getValue()],
  }),
  columnHelper.accessor('statut', {
    header: 'STATUT',
    cell: (info) => (
      <Badge variant={getStatusVariant(info.getValue())}>{STATUT_LABELS[info.getValue()]}</Badge>
    ),
  }),
  columnHelper.accessor('derniere_collecte', {
    header: 'DERNIÈRE COLLECTE',
  }),
  columnHelper.display({
    id: 'actions',
    header: 'ACTIONS',
    cell: () => (
      <Button variant="ghost" size="sm">
        Voir détails
      </Button>
    ),
  }),
];

function getStatusVariant(statut: Source['statut']) {
  switch (statut) {
    case 'validee':
      return 'green';
    case 'en_attente':
      return 'amber';
    case 'erreur':
      return 'red';
    default:
      return 'neutral';
  }
}

interface SourcesTableProps {
  data: Source[];
}

export function SourcesTable({ data }: SourcesTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-[12px] border border-line">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-medium text-ink-secondary">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-sm">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
