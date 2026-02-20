# SPEC-004 Implementation Prompt — Claims Explorer

**For:** Framework Desktop (implementor)
**Spec:** `docs/specs/SPEC-004-claims-explorer.md`
**Date:** 2026-02-20

---

## Context

You're implementing the Claims Explorer page at `/explorer`. The spec is complete at `docs/specs/SPEC-004-claims-explorer.md` — read it fully before starting. This prompt covers **patterns established during SPEC-003 bug fixing** that you must follow, plus implementation notes.

---

## Critical Patterns (from SPEC-003 post-implementation fixes)

### 1. FilterBar is already built — DO NOT modify it

`src/components/filter-bar.tsx` is shared between Overview and Explorer. It already:

- Has `__all__` sentinel value for Formulary, State, and MONY dropdowns (resets filter on select)
- Has **no date picker** (removed — month-click on charts is the only date filter mechanism)
- Shows Drug/Manufacturer/Group comboboxes when `view="explorer"`
- Has the flagged NDC toggle (right-aligned, sends `?flagged=true` param)
- Has chip pills with "Clear all" button

**Your Explorer page just renders `<FilterBar view="explorer" />` — it already works.**

### 2. Fill missing months with zeros

When filters exclude data from certain months (e.g., Kryptonite excluded = May has 0 claims), the API returns **no row for that month**. Charts must still show all 12 months.

**Use `fillAllMonths()` from `src/lib/format.ts`:**

```typescript
import { fillAllMonths } from '@/lib/format';

// Before passing to any monthly chart:
<MiniTrend data={fillAllMonths(data.monthly)} />
```

This inserts `{ month: 'YYYY-MM', incurred: 0, reversed: 0 }` for missing months. Without this, the chart interpolates over gaps and hides real drops to zero.

### 3. `formatPercent` expects 0-100 input

The API returns rates as 0-100 (not 0-1). `formatPercent(10.81)` → `"10.8%"`. Do NOT multiply by 100.

```typescript
import { formatPercent } from '@/lib/format';
// formatPercent(data.reversalRate) — just call it directly
```

### 4. NDC toggle param name is `flagged`

The URL param is `flagged=true` (not `includeFlaggedNdcs`). This is already handled by `useFilters()` — just pass the filter state to your fetch URL the same way Overview does:

```typescript
if (filters.includeFlaggedNdcs) params.set('flagged', 'true');
```

### 5. No KPI delta arrows — Explorer doesn't have a KPI row

SPEC-004 has no KPI summary row (per the spec's Non-Goals). The Overview's share-of-total subtitle pattern is not needed here.

### 6. Month-click on mini trend = date filter toggle

The mini monthly trend chart should support the same click behavior as Overview's hero chart:

```typescript
import { getLastDayOfMonth } from '@/lib/format';

const handleMonthClick = useCallback((yearMonth: string) => {
  const start = `${yearMonth}-01`;
  if (filters.dateStart === start) {
    removeFilter('dateStart');
    removeFilter('dateEnd');
  } else {
    setFilter('dateStart', start);
    setFilter('dateEnd', getLastDayOfMonth(yearMonth));
  }
}, [filters.dateStart, setFilter, removeFilter]);
```

### 7. Chart top margin for labels

If you add reference lines or labels to any chart, use `margin={{ top: 24, ... }}` to prevent clipping. The Overview hero chart had this issue.

---

## Data Fetching Pattern (copy from Overview)

```typescript
const { filters, setFilter, removeFilter } = useFilters();

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

useEffect(() => {
  let cancelled = false;
  setLoading(true);
  fetch(`/api/claims?${queryString}`)
    .then(res => res.json())
    .then((json: ClaimsResponse) => { if (!cancelled) { setData(json); setLoading(false); } })
    .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
  return () => { cancelled = true; };
}, [queryString]);
```

---

## Cross-filtering patterns

All chart clicks use `toggleFilter` or `setFilter`/`removeFilter` from `useFilters()`:

```typescript
// Toggle a dimension filter (click to filter, click again to clear)
const handleMonyClick = useCallback((type: string) => {
  filters.mony === type ? removeFilter('mony') : setFilter('mony', type);
}, [filters.mony, setFilter, removeFilter]);

// Drug table row click
const handleDrugClick = useCallback((drugName: string) => {
  filters.drug === drugName ? removeFilter('drug') : setFilter('drug', drugName);
}, [filters.drug, setFilter, removeFilter]);
```

---

## `generateInsights` — extend, don't replace

`src/lib/generate-insights.ts` currently has Overview templates. For Explorer, you need to:

1. Update the function signature to accept `ClaimsResponse | OverviewResponse` (or use a union type)
2. Add Explorer-specific templates with `match: (f, d, v) => v === 'explorer' && ...`
3. Keep all existing Overview templates untouched

The spec lists 10+ template categories needed. Consultant-analyst tone, data-grounded.

---

## Existing utilities to use

| Utility | Location | Purpose |
|---------|----------|---------|
| `formatNumber` | `src/lib/format.ts` | `531988 → "531,988"` |
| `formatPercent` | `src/lib/format.ts` | `10.81 → "10.8%"` (input is 0-100) |
| `abbreviateNumber` | `src/lib/format.ts` | `531988 → "532K"` |
| `fillAllMonths` | `src/lib/format.ts` | Fills missing months with zeros |
| `formatMonthLabel` | `src/lib/format.ts` | `"2021-01" → "Jan"` |
| `getLastDayOfMonth` | `src/lib/format.ts` | `"2021-09" → "2021-09-30"` |
| `InsightCards` | `src/components/overview/insight-cards.tsx` | Reusable insight card renderer |
| `Skeleton` | `src/components/ui/skeleton.tsx` | Loading shimmer |

---

## File checklist

```
src/
  app/
    explorer/
      page.tsx                          # Replace placeholder with full implementation
  components/
    explorer/
      mini-trend.tsx                    # Compact monthly area chart (~150px)
      drugs-table.tsx                   # Sortable, paginated drug table
      days-supply-chart.tsx             # Histogram bars
      mony-donut.tsx                    # M/O/N/Y donut
      top-groups-chart.tsx              # Horizontal bar chart
      top-manufacturers-chart.tsx       # Horizontal bar chart
  lib/
    generate-insights.ts                # ADD Explorer templates (don't break Overview)
```

---

## Header style (match Overview)

```tsx
<h1 className="text-2xl font-semibold">Claims Explorer</h1>
<p className="text-muted-foreground">Pharmacy A — Drug-Level Drill-Down & Distribution Analysis</p>
```

Note: spec says `font-semibold`, not `font-bold`. The current placeholder has `font-bold` — fix it.

---

## Smoke test checklist

After implementation, verify:

- [ ] Page loads at `/explorer` with all sections visible
- [ ] Changing any filter re-fetches data and updates all charts
- [ ] Selecting a state → May shows near-zero on mini trend (Kryptonite excluded)
- [ ] Clicking "All Formularies" / "All States" / "All MONY" resets that filter
- [ ] Clear all button resets everything
- [ ] Drug table sorts by clicking column headers
- [ ] Clicking a drug row filters to that drug (chip appears, charts update)
- [ ] Clicking the same drug row again clears the filter
- [ ] MONY donut slices are clickable and toggle filter
- [ ] Flagged NDC toggle works (Kryptonite appears in drug table when ON)
- [ ] Skeleton loading states show while fetching
- [ ] No TypeScript errors (`npx tsc --noEmit`)
