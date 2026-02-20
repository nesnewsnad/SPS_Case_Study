'use client';

import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnomalyMiniChart as MiniChartData } from '@/lib/api-types';

// Colors
const TEAL = '#0d9488';
const AMBER = '#d97706';
const GRAY = '#9ca3af';
const RED = '#dc2626';
const BLUE = '#2563eb';
const GREEN = '#16a34a';

// Known month keys get specific colors (KS batch pattern)
const MONTH_COLORS: Record<string, string> = {
  jul: GREEN,
  aug: RED,
  sep: BLUE,
};

function detectKeys(data: Record<string, number | string>[]) {
  if (!data.length) return { categoryKey: '', numericKeys: [] as string[] };
  const first = data[0];
  let categoryKey = '';
  const numericKeys: string[] = [];
  for (const [key, val] of Object.entries(first)) {
    if (typeof val === 'string') {
      categoryKey = key;
    } else {
      numericKeys.push(key);
    }
  }
  return { categoryKey, numericKeys };
}

function getBarColor(key: string, index: number): string {
  const lower = key.toLowerCase();
  // Reversal rate keys → amber
  if (lower.includes('reversal') || lower.includes('rate')) return AMBER;
  // Month-specific keys (jul/aug/sep)
  if (MONTH_COLORS[lower]) return MONTH_COLORS[lower];
  // Average → gray
  if (lower === 'average') return GRAY;
  // Default by index
  return index === 0 ? TEAL : index === 1 ? GRAY : AMBER;
}

function abbreviateValue(v: number): string {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}K`;
  if (v % 1 !== 0) return v.toFixed(1);
  return String(v);
}

interface Props {
  chart: MiniChartData;
}

export const AnomalyMiniChart = memo(function AnomalyMiniChart({ chart }: Props) {
  const { categoryKey, numericKeys } = detectKeys(chart.data);

  if (!categoryKey || !numericKeys.length) return null;

  // Abbreviate long category labels (e.g. "2021-09" → "Sep")
  const monthMap: Record<string, string> = {
    '2021-01': 'Jan',
    '2021-02': 'Feb',
    '2021-03': 'Mar',
    '2021-04': 'Apr',
    '2021-05': 'May',
    '2021-06': 'Jun',
    '2021-07': 'Jul',
    '2021-08': 'Aug',
    '2021-09': 'Sep',
    '2021-10': 'Oct',
    '2021-11': 'Nov',
    '2021-12': 'Dec',
  };

  const formattedData = chart.data.map((d) => {
    const cat = String(d[categoryKey]);
    return { ...d, [categoryKey]: monthMap[cat] ?? cat };
  });

  const isStacked = chart.type === 'stacked-bar';

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm font-medium">{chart.title}</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis
              dataKey={categoryKey}
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              interval={0}
              angle={numericKeys.length > 1 || formattedData.length > 8 ? -45 : 0}
              textAnchor={numericKeys.length > 1 || formattedData.length > 8 ? 'end' : 'middle'}
              height={numericKeys.length > 1 || formattedData.length > 8 ? 50 : 30}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              tickFormatter={abbreviateValue}
              width={45}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [abbreviateValue(Number(value)), String(name)]}
            />
            {numericKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getBarColor(key, i)}
                radius={isStacked ? undefined : [2, 2, 0, 0]}
                stackId={isStacked ? 'stack' : undefined}
                maxBarSize={40}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});
