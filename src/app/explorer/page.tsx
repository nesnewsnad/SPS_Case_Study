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
import { Download } from 'lucide-react';
import {
  fillAllMonths,
  getLastDayOfMonth,
  formatMonthFull,
  formatNumber,
  formatPercent,
} from '@/lib/format';
import { formatCsvContent, downloadCsv } from '@/lib/export-csv';
import type { CsvSection } from '@/lib/export-csv';
import type { ClaimsResponse } from '@/lib/api-types';

/** Build a contextual subtitle fragment from active filters. */
function filterContext(filters: {
  state?: string;
  formulary?: string;
  mony?: string;
  drug?: string;
  manufacturer?: string;
  groupId?: string;
  dateStart?: string;
  dateEnd?: string;
}): string {
  const parts: string[] = [];
  if (filters.state) parts.push(String(filters.state));
  if (filters.formulary) parts.push(String(filters.formulary));
  if (filters.mony) {
    const labels: Record<string, string> = {
      M: 'Brand Multi',
      O: 'Generic Multi',
      N: 'Brand Single',
      Y: 'Generic Single',
    };
    parts.push(labels[String(filters.mony)] ?? String(filters.mony));
  }
  if (filters.drug) parts.push(String(filters.drug));
  if (filters.manufacturer) parts.push(String(filters.manufacturer));
  if (filters.groupId) parts.push(`Group ${filters.groupId}`);
  if (filters.dateStart && filters.dateEnd) {
    parts.push(
      `${formatMonthFull(String(filters.dateStart).slice(0, 7))} – ${formatMonthFull(String(filters.dateEnd).slice(0, 7))}`,
    );
  } else if (filters.dateStart) {
    parts.push(`From ${formatMonthFull(String(filters.dateStart).slice(0, 7))}`);
  }
  return parts.length ? parts.join(' · ') : '';
}

// Dynamic imports — no SSR for chart components (Recharts uses browser APIs)
const MiniTrend = dynamic(
  () => import('@/components/explorer/mini-trend').then((m) => ({ default: m.MiniTrend })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const DrugsTable = dynamic(
  () => import('@/components/explorer/drugs-table').then((m) => ({ default: m.DrugsTable })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const DaysSupplyChart = dynamic(
  () =>
    import('@/components/explorer/days-supply-chart').then((m) => ({ default: m.DaysSupplyChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const MonyDonut = dynamic(
  () => import('@/components/explorer/mony-donut').then((m) => ({ default: m.MonyDonut })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const TopGroupsChart = dynamic(
  () =>
    import('@/components/explorer/top-groups-chart').then((m) => ({ default: m.TopGroupsChart })),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);
const TopManufacturersChart = dynamic(
  () =>
    import('@/components/explorer/top-manufacturers-chart').then((m) => ({
      default: m.TopManufacturersChart,
    })),
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

    return () => {
      cancelled = true;
    };
  }, [queryString]);

  // Filter context string for dynamic titles
  const ctx = useMemo(() => filterContext(filters), [filters]);

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
      filters.manufacturer === manufacturer
        ? removeFilter('manufacturer')
        : setFilter('manufacturer', manufacturer);
    },
    [filters.manufacturer, setFilter, removeFilter],
  );

  const handleExport = useCallback(() => {
    if (!data) return;
    const sections: CsvSection[] = [
      {
        heading: 'KPI Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Claims', formatNumber(data.kpis.totalClaims)],
          ['Net Claims', formatNumber(data.kpis.netClaims)],
          ['Reversal Rate', formatPercent(data.kpis.reversalRate)],
          ['Unique Drugs', formatNumber(data.kpis.uniqueDrugs)],
        ],
      },
      {
        heading: 'Monthly Trend',
        headers: ['Month', 'Incurred', 'Reversed'],
        rows: data.monthly.map((m) => [m.month, String(m.incurred), String(m.reversed)]),
      },
      {
        heading: 'Top Drugs',
        headers: [
          'Drug Name',
          'Label',
          'NDC',
          'Net Claims',
          'Reversal Rate',
          'Formulary',
          'Top State',
        ],
        rows: data.drugs.map((d) => [
          d.drugName,
          d.labelName ?? '',
          d.ndc,
          formatNumber(d.netClaims),
          formatPercent(d.reversalRate),
          d.formulary,
          d.topState,
        ]),
      },
      {
        heading: 'Days Supply Distribution',
        headers: ['Bin', 'Count'],
        rows: data.daysSupply.map((d) => [d.bin + ' days', formatNumber(d.count)]),
      },
      {
        heading: 'MONY Breakdown',
        headers: ['Type', 'Net Claims'],
        rows: data.mony.map((m) => [m.type, formatNumber(m.netClaims)]),
      },
      {
        heading: 'Top Groups',
        headers: ['Group ID', 'Net Claims'],
        rows: data.topGroups.map((g) => [g.groupId, formatNumber(g.netClaims)]),
      },
      {
        heading: 'Top Manufacturers',
        headers: ['Manufacturer', 'Net Claims'],
        rows: data.topManufacturers.map((m) => [m.manufacturer, formatNumber(m.netClaims)]),
      },
    ];
    const content = formatCsvContent({
      title: 'Claims Explorer',
      filters: ctx,
      entity: 'Pharmacy A',
      sections,
    });
    downloadCsv('sps-explorer.csv', content);
  }, [data, ctx]);

  // --- Error state ---
  if (error) {
    return (
      <>
        <FilterBar view="explorer" />
        <div className="flex flex-col items-center justify-center space-y-4 p-12">
          <p className="text-destructive font-medium">Failed to load explorer data</p>
          <p className="text-muted-foreground text-sm">{error}</p>
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
            <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
            <p className="text-muted-foreground text-sm">
              Pharmacy A — Drug-Level Drill-Down &amp; Distribution Analysis
            </p>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
          </div>
          <ChartSkeleton height="h-36" />
          <div className="grid gap-4 lg:grid-cols-5">
            <TableSkeleton />
            <div className="space-y-4 lg:col-span-2">
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
        <div className="flex flex-col items-center justify-center space-y-4 p-12">
          <p className="text-lg font-medium">No data matches current filters</p>
          <p className="text-muted-foreground text-sm">
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
      <div className="stagger-children space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
            <p className="text-muted-foreground text-sm">
              {ctx
                ? `Pharmacy A — ${ctx}`
                : 'Pharmacy A — Drug-Level Drill-Down & Distribution Analysis'}
            </p>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0 gap-1.5">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Mini Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-sm">
              Monthly Trend
              <span className="text-muted-foreground/60 ml-2 hidden text-[10px] font-normal tracking-wide md:inline">
                click chart to filter
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-36">
            <MiniTrend
              data={fillAllMonths(data.monthly)}
              onMonthClick={handleMonthClick}
              showFlaggedAnnotation={filters.includeFlaggedNdcs}
            />
          </CardContent>
        </Card>

        {/* Middle row: Drugs table (3/5) + Days Supply & MONY stacked (2/5) */}
        <div className="grid gap-4 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>
                {ctx ? `Top Drugs — ${ctx}` : 'Top Drugs by Volume'}
                <span className="text-muted-foreground/60 ml-2 hidden text-[10px] font-normal tracking-wide md:inline">
                  click row to filter
                </span>
              </CardTitle>
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

          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{ctx ? `Days Supply — ${ctx}` : 'Days Supply Distribution'}</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <DaysSupplyChart data={data.daysSupply} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  Brand vs. Generic Mix (MONY)
                  <span className="text-muted-foreground/60 ml-2 hidden text-[10px] font-normal tracking-wide md:inline">
                    click chart to filter
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                <MonyDonut data={data.mony} onSliceClick={handleMonyClick} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom row: Groups + Manufacturers */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {ctx ? `Groups — ${ctx}` : 'Group Volume'}
                <span className="text-muted-foreground/60 ml-2 hidden text-[10px] font-normal tracking-wide md:inline">
                  click chart to filter
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <TopGroupsChart data={data.topGroups} onBarClick={handleGroupClick} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                {ctx ? `Manufacturers — ${ctx}` : 'Manufacturer Volume'}
                <span className="text-muted-foreground/60 ml-2 hidden text-[10px] font-normal tracking-wide md:inline">
                  click chart to filter
                </span>
              </CardTitle>
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
        {insights.length > 0 && (
          <section className="space-y-3 border-t pt-6">
            <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Automated Insights
            </h2>
            <InsightCards insights={insights} />
          </section>
        )}
      </div>
    </>
  );
}
