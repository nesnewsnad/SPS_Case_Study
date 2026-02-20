'use client';

import { memo, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyDataPoint } from '@/lib/api-types';
import { formatMonthLabel, formatMonthFull, formatNumber, formatAxisTick } from '@/lib/format';

const COLORS = {
  incurred: '#0d9488',
  reversed: '#dc2626',
} as const;

interface MiniTrendProps {
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

export const MiniTrend = memo(function MiniTrend({ data, onMonthClick }: MiniTrendProps) {
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
        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={formatAxisTick}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
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
