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

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const incurred = payload.find((p) => p.dataKey === 'incurred')?.value ?? 0;
  const reversed = payload.find((p) => p.dataKey === 'reversed')?.value ?? 0;
  const net = incurred - reversed;

  return (
    <div className="chart-tooltip">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {formatMonthFull(label)}
      </p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: COLORS.incurred }}
            />
            Incurred
          </span>
          <span className="font-mono text-sm font-semibold">{formatNumber(incurred)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-sm">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: COLORS.reversed }}
            />
            Reversed
          </span>
          <span className="font-mono text-sm font-semibold">{formatNumber(reversed)}</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-6 border-t pt-1.5">
          <span className="text-sm font-medium">Net</span>
          <span className="font-mono text-sm font-bold">{formatNumber(net)}</span>
        </div>
      </div>
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
