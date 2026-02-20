'use client';

import { memo } from 'react';
import type { AdjudicationSummary } from '@/lib/api-types';
import { formatPercent, formatNumber } from '@/lib/format';

interface AdjudicationGaugeProps {
  data: AdjudicationSummary;
  isFiltered: boolean;
}

export const AdjudicationGauge = memo(function AdjudicationGauge({
  data,
  isFiltered,
}: AdjudicationGaugeProps) {
  const notAdjRate = 100 - data.rate;

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-4">
      {/* Big stat */}
      <div className="text-center">
        <span className="bg-gradient-to-br from-teal-600 to-teal-800 bg-clip-text font-mono text-5xl font-bold tracking-tighter text-transparent">
          {formatPercent(data.rate)}
        </span>
        <p className="text-muted-foreground mt-1.5 text-sm">adjudicated at point of sale</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 transition-all duration-700 ease-out"
            style={{ width: `${data.rate}%` }}
          />
        </div>
        {/* Legend */}
        <div className="text-muted-foreground mt-2.5 flex justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-teal-400 to-teal-600" />
            Adjudicated ({formatNumber(data.adjudicated)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-slate-200" />
            Not Adjudicated ({formatNumber(data.notAdjudicated)})
          </span>
        </div>
      </div>

      {/* Context note */}
      <p className="text-muted-foreground text-center text-xs leading-relaxed">
        {isFiltered
          ? `${formatPercent(notAdjRate)} not adjudicated at POS in this selection.`
          : 'Typical for LTC pharmacies — claims are often processed retrospectively.'}
      </p>
    </div>
  );
});
