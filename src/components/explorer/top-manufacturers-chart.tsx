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
import type { ManufacturerVolume } from '@/lib/api-types';
import { formatNumber } from '@/lib/format';

const BAR_COLOR = '#8b5cf6'; // violet

interface TopManufacturersChartProps {
  data: ManufacturerVolume[];
  onBarClick?: (manufacturer: string) => void;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ManufacturerVolume }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-semibold mb-1">{d.manufacturer}</p>
      <p className="font-mono">Net Claims: {formatNumber(d.netClaims)}</p>
    </div>
  );
}

export const TopManufacturersChart = memo(function TopManufacturersChart({
  data,
  onBarClick,
}: TopManufacturersChartProps) {
  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (entry: any) => {
      const manufacturer =
        entry?.manufacturer ?? entry?.payload?.manufacturer;
      if (onBarClick && manufacturer) onBarClick(manufacturer);
    },
    [onBarClick],
  );

  // Truncate long manufacturer names for Y-axis
  const truncated = data.map((d) => ({
    ...d,
    displayName:
      d.manufacturer.length > 18
        ? d.manufacturer.slice(0, 16) + '...'
        : d.manufacturer,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={truncated}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={(v: number) => `${Math.round(v / 1000)}K`}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          type="category"
          dataKey="displayName"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          width={110}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="netClaims"
          fill={BAR_COLOR}
          radius={[0, 4, 4, 0]}
          className="cursor-pointer"
          onClick={handleClick}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});
