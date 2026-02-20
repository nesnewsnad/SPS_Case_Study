'use client';

import { memo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="bg-background rounded-md border px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-semibold">{d.manufacturer}</p>
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
      const manufacturer = entry?.manufacturer ?? entry?.payload?.manufacturer;
      if (onBarClick && manufacturer) onBarClick(manufacturer);
    },
    [onBarClick],
  );

  if (data.length <= 1) {
    const item = data[0];
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">Filtered to</p>
        <p className="mt-1 text-lg font-semibold" title={item?.manufacturer}>
          {item?.manufacturer ?? 'No data'}
        </p>
        {item && (
          <p className="mt-2 font-mono text-2xl font-bold" style={{ color: BAR_COLOR }}>
            {formatNumber(item.netClaims)}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">net claims</p>
        {item && onBarClick && (
          <button
            onClick={() => onBarClick(item.manufacturer)}
            className="text-muted-foreground hover:text-foreground mt-3 text-xs underline underline-offset-2"
          >
            Click to clear filter
          </button>
        )}
      </div>
    );
  }

  // Truncate long manufacturer names for Y-axis
  const truncated = data.map((d) => ({
    ...d,
    displayName: d.manufacturer.length > 18 ? d.manufacturer.slice(0, 16) + '...' : d.manufacturer,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={truncated}
        layout="vertical"
        margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
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
