'use client';

import { memo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { MonthlyDataPoint } from '@/lib/api-types';
import { formatMonthLabel, formatMonthFull, formatNumber } from '@/lib/format';

const COLORS = {
  incurred: '#0d9488',
  reversed: '#dc2626',
} as const;

const REFERENCE_LINES = [
  { month: '2021-09', label: 'Sep +41%', color: '#d97706' },
  { month: '2021-11', label: 'Nov −54%', color: '#64748b' },
] as const;

interface MonthlyAreaChartProps {
  data: MonthlyDataPoint[];
  onMonthClick?: (yearMonth: string) => void;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length || !label) return null;
  const incurred = payload.find(p => p.dataKey === 'incurred')?.value ?? 0;
  const reversed = payload.find(p => p.dataKey === 'reversed')?.value ?? 0;
  const net = incurred - reversed;

  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-semibold mb-1">{formatMonthFull(label)}</p>
      <p className="font-mono" style={{ color: COLORS.incurred }}>
        Incurred: {formatNumber(incurred)}
      </p>
      <p className="font-mono" style={{ color: COLORS.reversed }}>
        Reversed: {formatNumber(reversed)}
      </p>
      <p className="font-mono font-semibold mt-1 border-t pt-1">
        Net: {formatNumber(net)}
      </p>
    </div>
  );
}

export const MonthlyAreaChart = memo(function MonthlyAreaChart({
  data,
  onMonthClick,
}: MonthlyAreaChartProps) {
  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state: any) => {
      if (state?.activeLabel != null && onMonthClick) {
        onMonthClick(String(state.activeLabel));
      }
    },
    [onMonthClick],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        onClick={handleClick}
        margin={{ top: 24, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {REFERENCE_LINES.map((ref) => (
          <ReferenceLine
            key={ref.month}
            x={ref.month}
            stroke={ref.color}
            strokeDasharray="4 4"
            label={{ value: ref.label, position: 'top', fontSize: 11, fill: ref.color }}
          />
        ))}
        <Area
          type="monotone"
          dataKey="incurred"
          stackId="1"
          stroke={COLORS.incurred}
          fill={COLORS.incurred}
          fillOpacity={0.3}
        />
        <Area
          type="monotone"
          dataKey="reversed"
          stackId="1"
          stroke={COLORS.reversed}
          fill={COLORS.reversed}
          fillOpacity={0.3}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
