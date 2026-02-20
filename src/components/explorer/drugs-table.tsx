'use client';

import { memo, useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type { DrugRow } from '@/lib/api-types';
import { formatNumber, formatPercent } from '@/lib/format';

interface DrugsTableProps {
  data: DrugRow[];
  activeDrug?: string;
  onDrugClick?: (drugName: string) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
}

const FORMULARY_COLORS: Record<string, string> = {
  OPEN: 'bg-teal-100 text-teal-800',
  MANAGED: 'bg-blue-100 text-blue-800',
  HMF: 'bg-violet-100 text-violet-800',
};

function ReversalRateCell({ value }: { value: number }) {
  let color = '';
  if (value > 20) color = 'text-red-600 font-semibold';
  else if (value > 15) color = 'text-amber-600 font-semibold';

  return <span className={`font-mono ${color}`}>{formatPercent(value)}</span>;
}

export const DrugsTable = memo(function DrugsTable({
  data,
  activeDrug,
  onDrugClick,
  limit,
  onLimitChange,
}: DrugsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'netClaims', desc: true }]);

  const handleRowClick = useCallback(
    (drugName: string) => {
      onDrugClick?.(drugName);
    },
    [onDrugClick],
  );

  const columns = useMemo<ColumnDef<DrugRow>[]>(
    () => [
      {
        accessorKey: 'drugName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Drug Name
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const name = row.original.drugName;
          const label = row.original.labelName;
          return (
            <div className="max-w-[200px]" title={label ?? name}>
              <span className="block truncate">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ndc',
        header: 'NDC',
        enableSorting: false,
        cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
      },
      {
        accessorKey: 'netClaims',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Net Claims
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="font-mono">{formatNumber(getValue<number>())}</span>
        ),
      },
      {
        accessorKey: 'reversalRate',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Rev. Rate
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => <ReversalRateCell value={getValue<number>()} />,
      },
      {
        accessorKey: 'formulary',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Formulary
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-1 h-3 w-3" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-1 h-3 w-3" />
            ) : (
              <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
            )}
          </Button>
        ),
        cell: ({ getValue }) => {
          const type = getValue<string>();
          return (
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${FORMULARY_COLORS[type] ?? 'bg-gray-100 text-gray-800'}`}
            >
              {type}
            </span>
          );
        },
      },
      {
        accessorKey: 'topState',
        header: 'Top State',
        enableSorting: false,
        cell: ({ getValue }) => <span className="font-mono text-xs">{getValue<string>()}</span>,
      },
    ],
    [],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="border-border/60 overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-slate-50/80 hover:bg-slate-50/80">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground text-xs font-semibold tracking-wide"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const isActive = row.original.drugName === activeDrug;
                return (
                  <TableRow
                    key={row.id}
                    className={`cursor-pointer transition-colors ${isActive ? 'border-l-2 border-l-teal-500 bg-teal-50/80' : 'hover:bg-muted/40'}`}
                    onClick={() => handleRowClick(row.original.drugName)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  No drugs match current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-muted-foreground mr-1 text-xs font-medium">Show:</span>
        <Button
          variant={limit === 20 ? 'default' : 'ghost'}
          size="xs"
          onClick={() => onLimitChange(20)}
          className={
            limit === 20 ? 'bg-teal-600 text-white hover:bg-teal-700' : 'text-muted-foreground'
          }
        >
          Top 20
        </Button>
        <Button
          variant={limit === 50 ? 'default' : 'ghost'}
          size="xs"
          onClick={() => onLimitChange(50)}
          className={
            limit === 50 ? 'bg-teal-600 text-white hover:bg-teal-700' : 'text-muted-foreground'
          }
        >
          Top 50
        </Button>
      </div>
    </div>
  );
});
