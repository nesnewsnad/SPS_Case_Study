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
  Cell,
} from 'recharts';
import type { StateBreakdown } from '@/lib/api-types';
import { formatNumber, formatPercent, formatAxisTick } from '@/lib/format';

interface StateBarsProps {
  data: StateBreakdown[];
  activeState?: string;
  onBarClick?: (state: string) => void;
}

const ACTIVE_COLOR = '#0d9488';
const DIMMED_COLOR = '#d1d5db';

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: StateBreakdown }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {d.state}
      </p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Net Claims</span>
          <span className="font-mono text-sm font-semibold">{formatNumber(d.netClaims)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Total Claims</span>
          <span className="text-muted-foreground font-mono text-sm font-medium">
            {formatNumber(d.totalClaims)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Reversal Rate</span>
          <span className="font-mono text-sm font-semibold">{formatPercent(d.reversalRate)}</span>
        </div>
      </div>
    </div>
  );
}

export const StateBars = memo(function StateBars({
  data,
  activeState,
  onBarClick,
}: StateBarsProps) {
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
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatAxisTick}
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
          radius={[0, 4, 4, 0]}
          maxBarSize={40}
          className="cursor-pointer"
          onClick={handleClick}
        >
          {data.map((entry) => (
            <Cell
              key={entry.state}
              fill={!activeState || entry.state === activeState ? ACTIVE_COLOR : DIMMED_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});
