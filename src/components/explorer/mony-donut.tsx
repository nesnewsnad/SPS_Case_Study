'use client';

import { memo, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import type { MonyBreakdown } from '@/lib/api-types';
import { formatNumber, abbreviateNumber } from '@/lib/format';

const MONY_COLORS: Record<string, string> = {
  Y: '#0d9488', // teal — single-source generic (77%)
  N: '#8b5cf6', // violet — single-source brand (21%)
  O: '#1e3a5f', // navy — multi-source generic (1.4%)
  M: '#d97706', // amber — multi-source brand (1%)
};

const MONY_LABELS: Record<string, string> = {
  M: 'Multi-Source Brand',
  O: 'Multi-Source Generic',
  N: 'Single-Source Brand',
  Y: 'Single-Source Generic',
};

interface MonyDonutProps {
  data: MonyBreakdown[];
  onSliceClick?: (type: string) => void;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonyBreakdown & { total: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pct = d.total > 0 ? ((d.netClaims / d.total) * 100).toFixed(1) : '0';
  return (
    <div className="chart-tooltip">
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: MONY_COLORS[d.type] ?? '#94a3b8' }}
        />
        {d.type} — {MONY_LABELS[d.type] ?? d.type}
      </p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Net Claims</span>
          <span className="font-mono text-sm font-semibold">{formatNumber(d.netClaims)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Share</span>
          <span className="font-mono text-sm font-semibold">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export const MonyDonut = memo(function MonyDonut({ data, onSliceClick }: MonyDonutProps) {
  const total = data.reduce((sum, d) => sum + d.netClaims, 0);
  const enriched = data.map((d) => ({ ...d, total }));

  const handleClick = useCallback(
    (_: unknown, index: number) => {
      if (onSliceClick && data[index]) {
        onSliceClick(data[index].type);
      }
    },
    [onSliceClick, data],
  );

  const renderLegend = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (props: any) => {
      const { payload } = props;
      return (
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload?.map((entry: any) => (
            <li key={entry.value} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {MONY_LABELS[entry.value] ?? entry.value}
            </li>
          ))}
        </ul>
      );
    },
    [],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={enriched}
          dataKey="netClaims"
          nameKey="type"
          cx="50%"
          cy="45%"
          innerRadius="55%"
          outerRadius="80%"
          onClick={handleClick}
          className="cursor-pointer"
        >
          {enriched.map((entry) => (
            <Cell key={entry.type} fill={MONY_COLORS[entry.type] ?? '#94a3b8'} />
          ))}
          <Label
            value={abbreviateNumber(total)}
            position="center"
            className="fill-foreground font-mono text-lg font-bold"
          />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
});
