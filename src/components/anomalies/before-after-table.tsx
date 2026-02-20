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
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm font-medium">Impact of Excluding Test Drug</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead className="bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400">
              With Kryptonite
            </TableHead>
            <TableHead className="bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400">
              Without Kryptonite
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.metric}>
              <TableCell className="font-medium">{row.metric}</TableCell>
              <TableCell className="bg-red-50/50 font-mono text-sm dark:bg-red-950/10">
                {row.withFlagged}
              </TableCell>
              <TableCell className="bg-teal-50/50 font-mono text-sm dark:bg-teal-950/10">
                {row.withoutFlagged}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});
