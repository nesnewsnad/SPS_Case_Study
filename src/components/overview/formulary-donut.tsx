'use client';

import { memo, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
import type { FormularyBreakdown } from '@/lib/api-types';
import { formatNumber, formatPercent, abbreviateNumber } from '@/lib/format';

const COLORS: Record<string, string> = {
  OPEN: '#0d9488',
  MANAGED: '#1e3a5f',
  HMF: '#8b5cf6',
};

const DEFAULT_COLOR = '#94a3b8';

const FORMULARY_LABELS: Record<string, string> = {
  OPEN: 'Open Formulary',
  MANAGED: 'Managed Formulary',
  HMF: 'High Managed Formulary',
};

interface FormularyDonutProps {
  data: FormularyBreakdown[];
  onSliceClick?: (type: string) => void;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FormularyBreakdown }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = COLORS[d.type] ?? DEFAULT_COLOR;
  return (
    <div className="chart-tooltip">
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase">
        <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
        {d.type}
      </p>
      <div className="mt-1.5 space-y-1">
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Net Claims</span>
          <span className="font-mono text-sm font-semibold">{formatNumber(d.netClaims)}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-sm">Reversal Rate</span>
          <span className="font-mono text-sm font-semibold">{formatPercent(d.reversalRate)}</span>
        </div>
      </div>
    </div>
  );
}

export const FormularyDonut = memo(function FormularyDonut({
  data,
  onSliceClick,
}: FormularyDonutProps) {
  const total = data.reduce((sum, d) => sum + d.netClaims, 0);

  const handleClick = useCallback(
    (_: unknown, index: number) => {
      if (onSliceClick && data[index]) {
        onSliceClick(data[index].type);
      }
    },
    [onSliceClick, data],
  );

  const renderLegend = useMemo(
    () =>
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
                {FORMULARY_LABELS[entry.value] ?? entry.value}
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
          data={data}
          dataKey="netClaims"
          nameKey="type"
          cx="50%"
          cy="45%"
          innerRadius="55%"
          outerRadius="80%"
          onClick={handleClick}
          className="cursor-pointer"
        >
          {data.map((entry) => (
            <Cell key={entry.type} fill={COLORS[entry.type] ?? DEFAULT_COLOR} />
          ))}
          <Label
            value={abbreviateNumber(total)}
            position="center"
            className="fill-foreground font-mono text-xl font-bold"
          />
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
});
