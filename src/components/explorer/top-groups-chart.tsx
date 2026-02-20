'use client';

import { memo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { GroupVolume } from '@/lib/api-types';
import { formatNumber, formatAxisTick } from '@/lib/format';

const BAR_COLOR = '#1e3a5f'; // navy

interface TopGroupsChartProps {
  data: GroupVolume[];
  onBarClick?: (groupId: string) => void;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: GroupVolume }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Group {d.groupId}
      </p>
      <div className="mt-1.5 flex items-center justify-between gap-6">
        <span className="text-sm">Net Claims</span>
        <span className="font-mono text-sm font-semibold">{formatNumber(d.netClaims)}</span>
      </div>
    </div>
  );
}

export const TopGroupsChart = memo(function TopGroupsChart({
  data,
  onBarClick,
}: TopGroupsChartProps) {
  const handleClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (entry: any) => {
      const groupId = entry?.groupId ?? entry?.payload?.groupId;
      if (onBarClick && groupId) onBarClick(groupId);
    },
    [onBarClick],
  );

  if (data.length <= 1) {
    const item = data[0];
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-xs tracking-wide uppercase">Only Group</p>
        <p className="mt-1 text-lg font-semibold">{item?.groupId ?? 'N/A'}</p>
        {item && (
          <p className="mt-2 font-mono text-2xl font-bold" style={{ color: BAR_COLOR }}>
            {formatNumber(item.netClaims)}
          </p>
        )}
        <p className="text-muted-foreground mt-1 text-xs">net claims</p>
        {item && onBarClick && (
          <button
            onClick={() => onBarClick(item.groupId)}
            className="text-muted-foreground hover:text-foreground mt-3 text-xs underline underline-offset-2"
          >
            Click to clear filter
          </button>
        )}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatAxisTick}
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          type="category"
          dataKey="groupId"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          width={65}
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
