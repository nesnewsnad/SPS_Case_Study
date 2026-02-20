'use client';

import { memo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import type { BeforeAfterMetric } from '@/lib/api-types';

interface Props {
  data: BeforeAfterMetric[];
}

export const BeforeAfterTable = memo(function BeforeAfterTable({ data }: Props) {
  return (
    <div className="space-y-2.5">
      <h4 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
        Impact of Excluding Test Drug
      </h4>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-semibold tracking-wide">Metric</TableHead>
              <TableHead className="bg-red-50/80 text-xs font-semibold tracking-wide text-red-800">
                With Kryptonite
              </TableHead>
              <TableHead className="bg-teal-50/80 text-xs font-semibold tracking-wide text-teal-800">
                Without Kryptonite
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="text-sm font-medium">{row.metric}</TableCell>
                <TableCell className="bg-red-50/40 font-mono text-sm">{row.withFlagged}</TableCell>
                <TableCell className="bg-teal-50/40 font-mono text-sm">
                  {row.withoutFlagged}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});
