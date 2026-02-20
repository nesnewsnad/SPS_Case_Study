'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/filter-bar';
import { useFilters } from '@/contexts/filter-context';
import { KpiCard } from '@/components/overview/kpi-card';
import { InsightCards } from '@/components/overview/insight-cards';
import { generateInsights } from '@/lib/generate-insights';
import {
  formatNumber,
  formatPercent,
  abbreviateNumber,
  getLastDayOfMonth,
  fillAllMonths,
} from '@/lib/format';
import type { OverviewResponse } from '@/lib/api-types';

// Dynamic imports — no SSR for chart components (Recharts uses browser APIs)
const MonthlyAreaChart = dynamic(
  () => import('@/components/overview/monthly-area-chart').then(m => ({ default: m.MonthlyAreaChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const FormularyDonut = dynamic(
  () => import('@/components/overview/formulary-donut').then(m => ({ default: m.FormularyDonut })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const StateBars = dynamic(
  () => import('@/components/overview/state-bars').then(m => ({ default: m.StateBars })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const AdjudicationGauge = dynamic(
  () => import('@/components/overview/adjudication-gauge').then(m => ({ default: m.AdjudicationGauge })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

// --- Delta computation ---

const DIMENSION_COUNTS: Record<string, number> = {
  state: 5,
  formulary: 3,
  mony: 4,
  month: 12,
};

type FilterKey = 'state' | 'formulary' | 'mony' | 'dateStart' | 'groupId' | 'manufacturer' | 'drug' | 'ndc' | 'dateEnd';

function computeDelta(
  filtered: number,
  unfiltered: number,
  opts: { isRate?: boolean; isAdditive?: boolean },
  activeKeys: FilterKey[],
): { value: number; label: string } | undefined {
  // No delta when unfiltered
  if (activeKeys.length === 0) return undefined;
  if (unfiltered === 0) return undefined;

  if (opts.isRate) {
    // Rate metrics: compare directly (percentage point diff expressed as %)
    const diff = ((filtered - unfiltered) / unfiltered) * 100;
    return { value: diff, label: 'vs overall' };
  }

  // Additive count metrics (claims): compare against unfiltered / dimensionCount
  if (opts.isAdditive !== false) {
    const singleDim = activeKeys.length === 1 ? activeKeys[0] : null;
    const dimCount = singleDim && singleDim in DIMENSION_COUNTS
      ? DIMENSION_COUNTS[singleDim]
      : null;

    if (dimCount) {
      const expected = unfiltered / dimCount;
      const diff = ((filtered - expected) / expected) * 100;
      return { value: diff, label: 'vs avg' };
    }
  }

  // Non-additive metrics (unique drugs) or multi-dimension → compare against total
  const diff = ((filtered - unfiltered) / unfiltered) * 100;
  return { value: diff, label: 'vs total' };
}

// --- Skeleton sections ---

function KpiSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full" />
      </CardContent>
    </Card>
  );
}

// --- Main page ---

export default function OverviewPage() {
  const { filters, setFilter, removeFilter, clearAll } = useFilters();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build query string from filters
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('entityId', String(filters.entityId));
    if (filters.formulary) params.set('formulary', filters.formulary);
    if (filters.state) params.set('state', filters.state);
    if (filters.mony) params.set('mony', filters.mony);
    if (filters.manufacturer) params.set('manufacturer', filters.manufacturer);
    if (filters.drug) params.set('drug', filters.drug);
    if (filters.ndc) params.set('ndc', filters.ndc);
    if (filters.dateStart) params.set('dateStart', filters.dateStart);
    if (filters.dateEnd) params.set('dateEnd', filters.dateEnd);
    if (filters.groupId) params.set('groupId', filters.groupId);
    if (filters.includeFlaggedNdcs) params.set('flagged', 'true');
    return params.toString();
  }, [filters]);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/overview?${queryString}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json: OverviewResponse) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [queryString]);

  // Determine which filter keys are active (for delta computation)
  const activeFilterKeys = useMemo<FilterKey[]>(() => {
    const keys: FilterKey[] = [];
    if (filters.state) keys.push('state');
    if (filters.formulary) keys.push('formulary');
    if (filters.mony) keys.push('mony');
    if (filters.dateStart) keys.push('dateStart');
    if (filters.groupId) keys.push('groupId');
    if (filters.manufacturer) keys.push('manufacturer');
    if (filters.drug) keys.push('drug');
    if (filters.ndc) keys.push('ndc');
    return keys;
  }, [filters]);

  // Compute KPI deltas
  const kpiDeltas = useMemo(() => {
    if (!data) return { totalClaims: undefined, netClaims: undefined, reversalRate: undefined, uniqueDrugs: undefined };
    const { kpis, unfilteredKpis } = data;
    return {
      totalClaims: computeDelta(kpis.totalClaims, unfilteredKpis.totalClaims, {}, activeFilterKeys),
      netClaims: computeDelta(kpis.netClaims, unfilteredKpis.netClaims, {}, activeFilterKeys),
      reversalRate: computeDelta(kpis.reversalRate, unfilteredKpis.reversalRate, { isRate: true }, activeFilterKeys),
      uniqueDrugs: computeDelta(kpis.uniqueDrugs, unfilteredKpis.uniqueDrugs, { isAdditive: false }, activeFilterKeys),
    };
  }, [data, activeFilterKeys]);

  // Insight cards
  const insights = useMemo(() => {
    if (!data) return [];
    return generateInsights(filters, data, 'overview');
  }, [filters, data]);

  // Month click handler — sets dateStart + dateEnd, or clears if already selected
  const handleMonthClick = useCallback(
    (yearMonth: string) => {
      const start = `${yearMonth}-01`;
      if (filters.dateStart === start) {
        removeFilter('dateStart');
        removeFilter('dateEnd');
      } else {
        setFilter('dateStart', start);
        setFilter('dateEnd', getLastDayOfMonth(yearMonth));
      }
    },
    [filters.dateStart, setFilter, removeFilter],
  );

  // Chart click handlers
  const handleFormularyClick = useCallback(
    (type: string) => {
      if (filters.formulary === type) {
        removeFilter('formulary');
      } else {
        setFilter('formulary', type);
      }
    },
    [filters.formulary, setFilter, removeFilter],
  );

  const handleStateClick = useCallback(
    (state: string) => {
      if (filters.state === state) {
        removeFilter('state');
      } else {
        setFilter('state', state);
      }
    },
    [filters.state, setFilter, removeFilter],
  );

  const isFiltered = activeFilterKeys.length > 0;

  // --- Error state ---
  if (error) {
    return (
      <>
        <FilterBar view="overview" />
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <p className="text-destructive font-medium">Failed to load overview data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </>
    );
  }

  // --- Loading state ---
  if (loading || !data) {
    return (
      <>
        <FilterBar view="overview" />
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold">Executive Overview</h1>
            <p className="text-muted-foreground">Pharmacy A — 2021 Claims Utilization Summary</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)}
          </div>
          <div className="grid gap-4 lg:grid-cols-7">
            <ChartSkeleton className="lg:col-span-4" />
            <ChartSkeleton className="lg:col-span-3" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </>
    );
  }

  // --- Empty state ---
  if (data.kpis.totalClaims === 0) {
    return (
      <>
        <FilterBar view="overview" />
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <p className="text-lg font-medium">No data matches current filters</p>
          <p className="text-sm text-muted-foreground">
            Try removing some filters or clearing all to see the full dataset.
          </p>
          <Button variant="outline" onClick={clearAll}>
            Clear All Filters
          </Button>
        </div>
      </>
    );
  }

  // --- Loaded state ---
  return (
    <>
      <FilterBar view="overview" />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Executive Overview</h1>
          <p className="text-muted-foreground">Pharmacy A — 2021 Claims Utilization Summary</p>
        </div>

        {/* KPI Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Total Claims"
            value={formatNumber(data.kpis.totalClaims)}
            delta={kpiDeltas.totalClaims}
          />
          <KpiCard
            label="Net Claims"
            value={abbreviateNumber(data.kpis.netClaims)}
            delta={kpiDeltas.netClaims}
          />
          <KpiCard
            label="Reversal Rate"
            value={formatPercent(data.kpis.reversalRate)}
            delta={kpiDeltas.reversalRate}
          />
          <KpiCard
            label="Unique Drugs"
            value={formatNumber(data.kpis.uniqueDrugs)}
            delta={kpiDeltas.uniqueDrugs}
          />
        </div>

        {/* Hero row: Monthly trend (4/7) + Formulary donut (3/7) */}
        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Monthly Claims Volume</CardTitle>
              <p className="text-sm text-muted-foreground">Incurred vs. Reversed</p>
            </CardHeader>
            <CardContent className="h-80">
              <MonthlyAreaChart
                data={fillAllMonths(data.monthly)}
                onMonthClick={handleMonthClick}
              />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Formulary Mix</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <FormularyDonut
                data={data.formulary}
                onSliceClick={handleFormularyClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Second row: State bars + Adjudication gauge */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Claims by State</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <StateBars
                data={data.states}
                onBarClick={handleStateClick}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Adjudication Rate</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <AdjudicationGauge
                data={data.adjudication}
                isFiltered={isFiltered}
              />
            </CardContent>
          </Card>
        </div>

        {/* Insight cards */}
        <InsightCards insights={insights} />
      </div>
    </>
  );
}
