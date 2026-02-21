'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { BeforeAfterTable } from './before-after-table';
import type { AnomalyPanel as AnomalyPanelData } from '@/lib/api-types';

const AnomalyMiniChart = dynamic(
  () => import('./anomaly-mini-chart').then((m) => ({ default: m.AnomalyMiniChart })),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> },
);

// Severity badge mapping (frontend-only — API has no severity field)
const SEVERITY_MAP: Record<
  string,
  { label: string; color: string; border: string; accent: string }
> = {
  'kryptonite-xr': {
    label: 'Data Quality',
    color: 'bg-amber-100 text-amber-800',
    border: 'border-l-amber-400',
    accent: 'amber',
  },
  'sept-spike': {
    label: 'Volume Anomaly',
    color: 'bg-red-100 text-red-800',
    border: 'border-l-red-400',
    accent: 'red',
  },
  'nov-dip': {
    label: 'Volume Anomaly',
    color: 'bg-red-100 text-red-800',
    border: 'border-l-red-400',
    accent: 'red',
  },
  'ks-aug-batch-reversal': {
    label: 'Operational',
    color: 'bg-amber-100 text-amber-800',
    border: 'border-l-amber-400',
    accent: 'amber',
  },
  'cycle-fill-pattern': {
    label: 'Operational Pattern',
    color: 'bg-teal-100 text-teal-800',
    border: 'border-l-teal-400',
    accent: 'teal',
  },
  'semi-synthetic-flags': {
    label: 'Data Integrity',
    color: 'bg-violet-100 text-violet-800',
    border: 'border-l-violet-400',
    accent: 'violet',
  },
};

// Key stat badge colors
const STAT_COLORS: Record<string, string> = {
  'kryptonite-xr': 'bg-amber-100 text-amber-900 border-amber-200',
  'sept-spike': 'bg-red-100 text-red-900 border-red-200',
  'nov-dip': 'bg-red-100 text-red-900 border-red-200',
  'ks-aug-batch-reversal': 'bg-amber-100 text-amber-900 border-amber-200',
  'cycle-fill-pattern': 'bg-teal-100 text-teal-900 border-teal-200',
  'semi-synthetic-flags': 'bg-violet-100 text-violet-900 border-violet-200',
};

interface Props {
  panel: AnomalyPanelData;
}

export const AnomalyPanel = memo(function AnomalyPanel({ panel }: Props) {
  const severity = SEVERITY_MAP[panel.id] ?? {
    label: 'Info',
    color: 'bg-muted text-foreground',
    border: 'border-l-muted-foreground',
    accent: 'gray',
  };
  const statColor = STAT_COLORS[panel.id] ?? 'bg-muted text-foreground';

  // Mini chart grid: 1 = full, 2 = side-by-side, 3 = first full + two side-by-side
  const chartCount = panel.miniCharts.length;

  return (
    <Card className={cn('border-l-4', severity.border)}>
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center rounded-md border px-3 py-1.5 font-mono text-base font-bold md:text-lg ${statColor}`}
          >
            {panel.keyStat}
          </span>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{panel.title}</CardTitle>
          </div>
          <Badge className={`${severity.color} shrink-0 border-0`}>{severity.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* What We See */}
        <div>
          <SectionLabel>What We See</SectionLabel>
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
                <ChartContainer>
                  <AnomalyMiniChart chart={panel.miniCharts[0]} />
                </ChartContainer>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <ChartContainer>
                    <AnomalyMiniChart chart={panel.miniCharts[1]} />
                  </ChartContainer>
                  <ChartContainer>
                    <AnomalyMiniChart chart={panel.miniCharts[2]} />
                  </ChartContainer>
                </div>
              </>
            ) : (
              panel.miniCharts.map((chart, i) => (
                <ChartContainer key={i}>
                  <AnomalyMiniChart chart={chart} />
                </ChartContainer>
              ))
            )}
          </div>
        )}

        {/* Before/After Table (Kryptonite only) */}
        {panel.beforeAfter && <BeforeAfterTable data={panel.beforeAfter} />}

        {/* Why It Matters */}
        <div>
          <SectionLabel>Why It Matters</SectionLabel>
          <p className="text-sm leading-relaxed">{panel.whyItMatters}</p>
        </div>

        {/* To Confirm */}
        <div className="rounded-r border-l-4 border-amber-300 bg-amber-50/50 px-5 py-3.5">
          <h4 className="mb-1 text-xs font-semibold tracking-wider text-amber-700 uppercase">
            To Confirm
          </h4>
          <p className="text-sm leading-relaxed text-amber-900">{panel.toConfirm}</p>
        </div>

        {/* RFP Impact */}
        <div className="rounded-r border-l-4 border-teal-300 bg-teal-50/50 px-5 py-3.5">
          <h4 className="mb-1 text-xs font-semibold tracking-wider text-teal-700 uppercase">
            RFP Impact
          </h4>
          <p className="text-sm leading-relaxed text-teal-900">{panel.rfpImpact}</p>
        </div>
      </CardContent>
    </Card>
  );
});

// ── Shared sub-components ────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-muted-foreground mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
      {children}
    </h4>
  );
}

function ChartContainer({ children }: { children: React.ReactNode }) {
  return <div className="bg-muted/30 overflow-visible rounded-lg border p-4">{children}</div>;
}
