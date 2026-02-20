'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BeforeAfterTable } from './before-after-table';
import type { AnomalyPanel as AnomalyPanelData } from '@/lib/api-types';

const AnomalyMiniChart = dynamic(
  () => import('./anomaly-mini-chart').then((m) => ({ default: m.AnomalyMiniChart })),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> },
);

// Severity badge mapping (frontend-only — API has no severity field)
const SEVERITY_MAP: Record<string, { label: string; color: string }> = {
  'kryptonite-xr': { label: 'Data Quality', color: 'bg-amber-100 text-amber-800' },
  'sept-spike': { label: 'Volume Anomaly', color: 'bg-red-100 text-red-800' },
  'nov-dip': { label: 'Volume Anomaly', color: 'bg-red-100 text-red-800' },
  'ks-aug-batch-reversal': { label: 'Operational', color: 'bg-amber-100 text-amber-800' },
};

// Key stat badge colors
const STAT_COLORS: Record<string, string> = {
  'kryptonite-xr': 'bg-amber-100 text-amber-900 border-amber-200',
  'sept-spike': 'bg-red-100 text-red-900 border-red-200',
  'nov-dip': 'bg-red-100 text-red-900 border-red-200',
  'ks-aug-batch-reversal': 'bg-amber-100 text-amber-900 border-amber-200',
};

interface Props {
  panel: AnomalyPanelData;
}

export const AnomalyPanel = memo(function AnomalyPanel({ panel }: Props) {
  const severity = SEVERITY_MAP[panel.id] ?? { label: 'Info', color: 'bg-muted text-foreground' };
  const statColor = STAT_COLORS[panel.id] ?? 'bg-muted text-foreground';

  // Mini chart grid: 1 = full, 2 = side-by-side, 3 = first full + two side-by-side
  const chartCount = panel.miniCharts.length;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-lg font-bold ${statColor}`}
          >
            {panel.keyStat}
          </span>
          <CardTitle className="text-lg">{panel.title}</CardTitle>
          <Badge className={`${severity.color} ml-auto border-0`}>{severity.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* What We See */}
        <div>
          <h4 className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
            What We See
          </h4>
          <p className="text-sm leading-relaxed">{panel.whatWeSee}</p>
        </div>

        {/* Mini Charts */}
        {chartCount > 0 && (
          <div
            className={
              chartCount === 1
                ? 'grid grid-cols-1 gap-4'
                : chartCount === 2
                  ? 'grid grid-cols-1 gap-4 md:grid-cols-2'
                  : 'space-y-4'
            }
          >
            {chartCount === 3 ? (
              <>
                <AnomalyMiniChart chart={panel.miniCharts[0]} />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <AnomalyMiniChart chart={panel.miniCharts[1]} />
                  <AnomalyMiniChart chart={panel.miniCharts[2]} />
                </div>
              </>
            ) : (
              panel.miniCharts.map((chart, i) => <AnomalyMiniChart key={i} chart={chart} />)
            )}
          </div>
        )}

        {/* Before/After Table (Kryptonite only) */}
        {panel.beforeAfter && <BeforeAfterTable data={panel.beforeAfter} />}

        {/* Why It Matters */}
        <div>
          <h4 className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
            Why It Matters
          </h4>
          <p className="text-sm leading-relaxed">{panel.whyItMatters}</p>
        </div>

        {/* To Confirm */}
        <div className="rounded-r border-l-4 border-amber-300 bg-amber-50/50 py-1 pl-4">
          <h4 className="mb-1 text-sm font-semibold tracking-wide text-amber-700 uppercase">
            To Confirm
          </h4>
          <p className="text-sm leading-relaxed italic">{panel.toConfirm}</p>
        </div>

        {/* RFP Impact */}
        <div>
          <h4 className="text-muted-foreground mb-1 text-sm font-semibold tracking-wide uppercase">
            RFP Impact
          </h4>
          <p className="text-sm leading-relaxed text-teal-700 italic">{panel.rfpImpact}</p>
        </div>
      </CardContent>
    </Card>
  );
});
