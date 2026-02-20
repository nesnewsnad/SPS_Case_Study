'use client';

import { memo, useState, useCallback } from 'react';
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
import type { DaysSupplyBin } from '@/lib/api-types';
import { formatNumber } from '@/lib/format';

const BAR_COLOR = '#0d9488';
const ACTIVE_COLOR = '#99f6e4'; // teal-200

interface DaysSupplyChartProps {
  data: DaysSupplyBin[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DaysSupplyBin }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-semibold mb-1">{d.bin} days</p>
      <p className="font-mono">Count: {formatNumber(d.count)}</p>
    </div>
  );
}

export const DaysSupplyChart = memo(function DaysSupplyChart({
  data,
}: DaysSupplyChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = useCallback(
    (_: unknown, index: number) => {
      setActiveIndex((prev) => (prev === index ? null : index));
    },
    [],
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="bin"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          tickFormatter={(v: string) => `${v}d`}
        />
        <YAxis
          tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          className="cursor-pointer"
          onClick={handleClick}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={activeIndex === index ? ACTIVE_COLOR : BAR_COLOR}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});
