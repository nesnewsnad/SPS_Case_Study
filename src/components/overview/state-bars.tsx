'use client';

import { memo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { StateBreakdown } from '@/lib/api-types';
import { formatNumber, formatPercent } from '@/lib/format';

interface StateBarsProps {
  data: StateBreakdown[];
  onBarClick?: (state: string) => void;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: StateBreakdown }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-semibold mb-1">{d.state}</p>
      <p className="font-mono">Net Claims: {formatNumber(d.netClaims)}</p>
      <p className="font-mono">Total Claims: {formatNumber(d.totalClaims)}</p>
      <p className="font-mono">Reversal Rate: {formatPercent(d.reversalRate)}</p>
    </div>
  );
}

export const StateBars = memo(function StateBars({ data, onBarClick }: StateBarsProps) {
  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (entry: any) => {
      const state = entry?.state ?? entry?.payload?.state;
      if (onBarClick && state) onBarClick(state);
    },
    [onBarClick],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          type="category"
          dataKey="state"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          width={35}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="netClaims"
          fill="#0d9488"
          radius={[0, 4, 4, 0]}
          className="cursor-pointer"
          onClick={handleClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});
