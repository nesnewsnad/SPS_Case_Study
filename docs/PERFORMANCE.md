# Performance Patterns — Vercel React Best Practices

Applied from the Vercel React Best Practices skill (57 rules, 8 categories). These are the rules most relevant to our Recharts-heavy, filter-driven dashboard.

---

## CRITICAL — Do These First

### 1. Dynamic Import All Chart Components (`bundle-dynamic-imports`)

Recharts is heavy (~150KB gzipped). Every chart component should be lazy-loaded with `next/dynamic` since charts are client-only and not needed for initial render.

```tsx
// WRONG — bundles Recharts with the main chunk
import { MonthlyAreaChart } from './monthly-area-chart';

// RIGHT — loads Recharts on demand, shows skeleton while loading
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MonthlyAreaChart = dynamic(
  () => import('./monthly-area-chart').then((m) => m.MonthlyAreaChart),
  { ssr: false, loading: () => <Skeleton className="h-80 w-full" /> },
);
```

Apply to: every chart in `src/components/overview/` and `src/components/explorer/`.

### 2. `optimizePackageImports` for Barrel Files (`bundle-barrel-imports`)

Already configured in `next.config.ts`:

```ts
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts'],
}
```

This auto-transforms barrel imports to direct imports at build time. You can now safely write `import { AreaChart, XAxis } from 'recharts'` without the barrel penalty.

---

## HIGH — Do These During Implementation

### 3. Memoize Chart Wrapper Components (`rerender-memo`)

Wrap each chart component in `React.memo()` so it skips re-rendering when props haven't changed. Filter changes trigger a re-fetch, but while loading, the old chart data should stay stable.

```tsx
// Each chart wrapper
export const MonthlyAreaChart = memo(function MonthlyAreaChart({ data, onMonthClick }: Props) {
  // ... Recharts rendering
});
```

### 4. Derive State During Render, Not in Effects (`rerender-derived-state-no-effect`)

Insight cards, delta indicators, and formatted values should be computed during render — NOT stored in separate state or useEffect.

```tsx
// WRONG — extra state + effect
const [insights, setInsights] = useState<InsightCard[]>([]);
useEffect(() => {
  setInsights(generateInsights(filters, data));
}, [filters, data]);

// RIGHT — derive during render
const insights = useMemo(() => (data ? generateInsights(filters, data) : []), [filters, data]);
```

Same for delta indicators:

```tsx
// RIGHT — derive, don't store
const deltas = useMemo(
  () => computeDeltas(data.kpis, data.unfilteredKpis, filters),
  [data, filters],
);
```

### 5. Use `startTransition` for Filter Changes (`rerender-transitions`)

Filter state updates trigger re-fetches and re-renders of all charts. Wrap non-urgent updates in `startTransition` to keep the FilterBar responsive while charts re-render.

```tsx
// In FilterContext — wrap setFilter in startTransition
import { startTransition } from 'react';

const setFilter = useCallback((key, value) => {
  startTransition(() => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  });
}, []);
```

---

## MEDIUM — Apply Where Obvious

### 6. Ternary for Conditional Rendering (`rendering-conditional-render`)

Use explicit ternary when the condition could be `0` or falsy:

```tsx
// WRONG — renders "0" when activeFilterCount is 0
{
  activeFilterCount && <ClearAllButton />;
}

// RIGHT
{
  activeFilterCount > 0 ? <ClearAllButton /> : null;
}
```

### 7. Hoist Static JSX and Default Props (`rendering-hoist-jsx`, `rerender-memo-with-default-value`)

Chart colors, reference line configs, and other constants should be defined outside the component:

```tsx
// Outside the component — never recreated
const CHART_COLORS = { incurred: '#0d9488', reversed: '#dc2626' };
const REFERENCE_LINES = [
  { month: '2021-09', label: '▲ +41%', color: '#d97706' },
  { month: '2021-11', label: '▼ -54%', color: '#64748b' },
];

export const MonthlyAreaChart = memo(function MonthlyAreaChart({ data }: Props) {
  // Use CHART_COLORS and REFERENCE_LINES — stable references
});
```

### 8. Stable Callback References (`rerender-functional-setstate`)

Chart click handlers should use functional setState or useCallback with stable deps:

```tsx
// RIGHT — stable reference, no dependency on filters
const handleMonthClick = useCallback(
  (month: string) => {
    setFilter('dateStart', `${month}-01`);
    setFilter('dateEnd', getLastDayOfMonth(month));
  },
  [setFilter],
);
```

---

## NOT Applicable (Skip These)

| Rule                       | Why Skip                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `server-cache-react`       | Our pages are client components; API routes are stateless                                   |
| `client-swr-dedup`         | Spec says no external data-fetching library; our useEffect+fetch is fine for the case study |
| `bundle-defer-third-party` | No analytics/logging to defer                                                               |
| `advanced-*`               | Over-engineering for 3.5-day timeline                                                       |
