'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/filter-bar';
import { useFilters } from '@/contexts/filter-context';
import { InsightCards } from '@/components/overview/insight-cards';
import { generateInsights } from '@/lib/generate-insights';
import {
  fillAllMonths,
  getLastDayOfMonth,
} from '@/lib/format';
import type { ClaimsResponse } from '@/lib/api-types';

// Dynamic imports — no SSR for chart components (Recharts uses browser APIs)
const MiniTrend = dynamic(
  () => import('@/components/explorer/mini-trend').then(m => ({ default: m.MiniTrend })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const DrugsTable = dynamic(
  () => import('@/components/explorer/drugs-table').then(m => ({ default: m.DrugsTable })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const DaysSupplyChart = dynamic(
  () => import('@/components/explorer/days-supply-chart').then(m => ({ default: m.DaysSupplyChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const MonyDonut = dynamic(
  () => import('@/components/explorer/mony-donut').then(m => ({ default: m.MonyDonut })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const TopGroupsChart = dynamic(
  () => import('@/components/explorer/top-groups-chart').then(m => ({ default: m.TopGroupsChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const TopManufacturersChart = dynamic(
  () => import('@/components/explorer/top-manufacturers-chart').then(m => ({ default: m.TopManufacturersChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

// --- Skeleton sections ---

function ChartSkeleton({ className, height = 'h-72' }: { className?: string; height?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`${height} w-full`} />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

// --- Main page ---

export default function ExplorerPage() {
  const { filters, setFilter, removeFilter, clearAll } = useFilters();
  const [data, setData] = useState<ClaimsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

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
    params.set('limit', String(limit));
    return params.toString();
  }, [filters, limit]);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/claims?${queryString}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then((json: ClaimsResponse) => {
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

  // Insight cards
  const insights = useMemo(() => {
    if (!data) return [];
    return generateInsights(filters, data, 'explorer');
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

  // Cross-filtering handlers
  const handleDrugClick = useCallback(
    (drugName: string) => {
      filters.drug === drugName ? removeFilter('drug') : setFilter('drug', drugName);
    },
    [filters.drug, setFilter, removeFilter],
  );

  const handleMonyClick = useCallback(
    (type: string) => {
      filters.mony === type ? removeFilter('mony') : setFilter('mony', type);
    },
    [filters.mony, setFilter, removeFilter],
  );

  const handleGroupClick = useCallback(
    (groupId: string) => {
      filters.groupId === groupId ? removeFilter('groupId') : setFilter('groupId', groupId);
    },
    [filters.groupId, setFilter, removeFilter],
  );

  const handleManufacturerClick = useCallback(
    (manufacturer: string) => {
      filters.manufacturer === manufacturer ? removeFilter('manufacturer') : setFilter('manufacturer', manufacturer);
    },
    [filters.manufacturer, setFilter, removeFilter],
  );

  // --- Error state ---
  if (error) {
    return (
      <>
        <FilterBar view="explorer" />
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <p className="text-destructive font-medium">Failed to load explorer data</p>
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
        <FilterBar view="explorer" />
        <div className="space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold">Claims Explorer</h1>
            <p className="text-muted-foreground">Pharmacy A — Drug-Level Drill-Down &amp; Distribution Analysis</p>
          </div>
          <ChartSkeleton height="h-36" />
          <div className="grid gap-4 lg:grid-cols-5">
            <TableSkeleton />
            <div className="lg:col-span-2 space-y-4">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
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
        <FilterBar view="explorer" />
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
      <FilterBar view="explorer" />
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Claims Explorer</h1>
          <p className="text-muted-foreground">Pharmacy A — Drug-Level Drill-Down &amp; Distribution Analysis</p>
        </div>

        {/* Mini Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-36">
            <MiniTrend
              data={fillAllMonths(data.monthly)}
              onMonthClick={handleMonthClick}
            />
          </CardContent>
        </Card>

        {/* Middle row: Drugs table (3/5) + Days Supply & MONY stacked (2/5) */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Top Drugs by Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <DrugsTable
                data={data.drugs}
                activeDrug={filters.drug}
                onDrugClick={handleDrugClick}
                limit={limit}
                onLimitChange={setLimit}
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Days Supply Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <DaysSupplyChart data={data.daysSupply} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Brand vs. Generic Mix (MONY)</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <MonyDonut
                  data={data.mony}
                  onSliceClick={handleMonyClick}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom row: Top Groups + Top Manufacturers */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Groups by Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <TopGroupsChart
                data={data.topGroups}
                onBarClick={handleGroupClick}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Manufacturers by Volume</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <TopManufacturersChart
                data={data.topManufacturers}
                onBarClick={handleManufacturerClick}
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
