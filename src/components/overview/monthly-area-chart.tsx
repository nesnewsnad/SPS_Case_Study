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
import { formatMonthLabel, formatMonthFull, formatNumber, formatAxisTick } from '@/lib/format';

const COLORS = {
  incurred: '#0d9488',
  reversed: '#dc2626',
} as const;

// ── Annotation definitions ────────────────────────────────────────────

interface Annotation {
  month: string;
  title: string;
  detail: string;
  color: string;
  position: 'top' | 'bottom';
}

const ALWAYS_ANNOTATIONS: Annotation[] = [
  {
    month: '2021-09',
    title: 'Volume Spike',
    detail: '+41% vs avg',
    color: '#d97706',
    position: 'top',
  },
  {
    month: '2021-11',
    title: 'Volume Dip',
    detail: '−54% vs avg',
    color: '#64748b',
    position: 'top',
  },
];

const FLAGGED_ANNOTATION: Annotation = {
  month: '2021-05',
  title: 'Test Drug',
  detail: '99% Kryptonite',
  color: '#dc2626',
  position: 'top',
};

// ── Custom annotation label ───────────────────────────────────────────

function AnnotationLabel({
  viewBox,
  annotation,
}: {
  viewBox?: { x?: number; y?: number };
  annotation: Annotation;
}) {
  if (!viewBox?.x) return null;
  const x = viewBox.x;
  const y = annotation.position === 'top' ? 4 : (viewBox.y ?? 0) + 16;

  return (
    <g>
      {/* Background pill */}
      <rect
        x={x - 38}
        y={y - 2}
        width={76}
        height={28}
        rx={6}
        fill="white"
        fillOpacity={0.92}
        stroke={annotation.color}
        strokeWidth={1}
        strokeOpacity={0.3}
      />
      {/* Title */}
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fill={annotation.color}
        letterSpacing={0.3}
      >
        {annotation.title}
      </text>
      {/* Detail */}
      <text
        x={x}
        y={y + 21}
        textAnchor="middle"
        fontSize={8}
        fontWeight={500}
        fill={annotation.color}
        opacity={0.75}
      >
        {annotation.detail}
      </text>
    </g>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────

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

// ── Main chart ────────────────────────────────────────────────────────

interface MonthlyAreaChartProps {
  data: MonthlyDataPoint[];
  onMonthClick?: (yearMonth: string) => void;
  showFlaggedAnnotation?: boolean;
}

export const MonthlyAreaChart = memo(function MonthlyAreaChart({
  data,
  onMonthClick,
  showFlaggedAnnotation,
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

  const annotations = showFlaggedAnnotation
    ? [...ALWAYS_ANNOTATIONS, FLAGGED_ANNOTATION]
    : ALWAYS_ANNOTATIONS;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        onClick={handleClick}
        className="cursor-pointer"
        margin={{ top: 34, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tickFormatter={formatAxisTick}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {annotations.map((ann) => (
          <ReferenceLine
            key={ann.month}
            x={ann.month}
            stroke={ann.color}
            strokeDasharray="4 4"
            strokeOpacity={0.6}
            label={<AnnotationLabel annotation={ann} />}
          />
        ))}
        <Area
          type="linear"
          dataKey="incurred"
          stackId="1"
          stroke={COLORS.incurred}
          fill={COLORS.incurred}
          fillOpacity={0.3}
        />
        <Area
          type="linear"
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
