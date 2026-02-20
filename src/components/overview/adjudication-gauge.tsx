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
    <div className="flex h-full flex-col justify-center gap-5 px-2">
      {/* Big stat */}
      <div className="text-center">
        <span className="font-mono text-4xl font-bold text-foreground">
          {formatPercent(data.rate)}
        </span>
        <p className="text-sm text-muted-foreground mt-1">adjudicated at point of sale</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-500"
            style={{ width: `${data.rate}%` }}
          />
        </div>
        {/* Legend */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-teal-600" />
            Adjudicated ({formatNumber(data.adjudicated)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-200" />
            Not Adjudicated ({formatNumber(data.notAdjudicated)})
          </span>
        </div>
      </div>

      {/* Context note */}
      <p className="text-xs text-muted-foreground text-center">
        {isFiltered
          ? `${formatPercent(notAdjRate)} not adjudicated at POS in this selection.`
          : 'Typical for LTC pharmacies — claims are often processed retrospectively.'}
      </p>
    </div>
  );
});
