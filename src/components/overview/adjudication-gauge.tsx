'use client';

import { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { AdjudicationSummary } from '@/lib/api-types';
import { formatPercent } from '@/lib/format';

const COLORS = ['#0d9488', '#94a3b8'] as const;

interface AdjudicationGaugeProps {
  data: AdjudicationSummary;
  isFiltered: boolean;
}

export const AdjudicationGauge = memo(function AdjudicationGauge({
  data,
  isFiltered,
}: AdjudicationGaugeProps) {
  const segments = [
    { name: 'Adjudicated', value: data.adjudicated },
    { name: 'Not Adjudicated', value: data.notAdjudicated },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx="50%"
            cy="85%"
            innerRadius="65%"
            outerRadius="95%"
          >
            {segments.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
            <Label
              value={formatPercent(data.rate)}
              position="center"
              dy={-10}
              className="fill-foreground font-mono text-lg font-bold"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-xs text-muted-foreground text-center max-w-[280px] -mt-2">
        {isFiltered
          ? `In the current selection, ${formatPercent(100 - data.rate)} of claims were not adjudicated at point of sale.`
          : '75% of claims were not adjudicated at point of sale — typical for long-term care pharmacies where claims are often processed retrospectively.'}
      </p>
    </div>
  );
});
