import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Collecte, STATUT_LABELS, TYPE_LABELS } from '../types/dashboard.types';

const columnHelper = createColumnHelper<Collecte>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: (info) => (
      <span className="font-mono text-sm">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor('source', {
    header: 'SOURCE',
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
  columnHelper.accessor('progression', {
    header: 'PROGRESSION',
    cell: (info) => (
      <div className="flex items-center">
        <Progress value={info.getValue()} className="w-20" />
        <span className="ml-2 text-sm">{info.getValue()}%</span>
      </div>
    ),
  }),
  columnHelper.accessor('pages', {
    header: 'PAGES',
  }),
  columnHelper.accessor('duree', {
    header: 'DURÉE',
  }),
  columnHelper.accessor('demarre', {
    header: 'DÉMARRÉ',
  }),
];

function getStatusVariant(statut: Collecte['statut']) {
  switch (statut) {
    case 'en_cours':
      return 'blue';
    case 'terminee':
      return 'green';
    case 'echouee':
      return 'red';
    default:
      return 'neutral';
  }
}

interface RecentCollectesTableProps {
  data: Collecte[];
}

export function RecentCollectesTable({ data }: RecentCollectesTableProps) {
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
