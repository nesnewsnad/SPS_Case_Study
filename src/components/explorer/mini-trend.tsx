'use client';

import { memo, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { MonthlyDataPoint } from '@/lib/api-types';
import { formatMonthLabel, formatMonthFull, formatNumber } from '@/lib/format';

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

export const MiniTrend = memo(function MiniTrend({
  data,
  onMonthClick,
}: MiniTrendProps) {
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
          tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
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
