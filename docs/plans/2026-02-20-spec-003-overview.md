# SPEC-003: Executive Overview — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Executive Overview page with KPIs, 4 chart types, delta indicators, and dynamic insight cards — all wired to live API data and cross-filtered via SPEC-002's FilterContext.

**Architecture:** Client-side data fetching (`useEffect` + `fetch`) from `/api/overview`, with all chart components dynamically imported via `next/dynamic` (no SSR). State derived during render with `useMemo` — no `useEffect` → `useState` anti-patterns. Charts wrapped in `React.memo()`.

**Tech Stack:** Next.js 14 (App Router), Recharts v3.7.0, shadcn/ui (Card, Skeleton), Tailwind CSS, Geist Mono/Sans fonts.

---

## Task 1: Shared Formatting Utilities

**Files:**
- Create: `src/lib/format.ts`

Helpers: `formatNumber` (comma-separated), `formatPercent` (one-decimal %), `abbreviateNumber` (50K/1.2M), `formatMonthLabel` ("Jan"), `formatMonthFull` ("January 2021"), `getLastDayOfMonth` ("2021-09" → "2021-09-30").

SPEC-004 will reuse this file.

---

## Task 2: Insight Template Engine

**Files:**
- Create: `src/lib/generate-insights.ts`

17 templates across required categories:
- Unfiltered: 3 (portfolio summary, distribution channel, LTC pattern)
- Per-state: 5 (CA, IN, PA, MN, KS with batch warning)
- Per-month: 3 (Sep surge, Nov dip, May synthetic)
- Per-formulary: 1 (any formulary)
- Per-MONY: 2 (Y generics, N brands)
- Multi-filter: 2 (state+formulary combo, groupId)
- Fallback: 1 (generic filtered view)

Signature: `generateInsights(filters, data, view?)` → `InsightCard[]` (max 3).
Priority-sorted, most-specific match wins. `view` param for SPEC-004 extensibility.

---

## Task 3: KPI Card Component

**Files:**
- Create: `src/components/overview/kpi-card.tsx`

`React.memo` wrapper. Props: `label`, `value` (pre-formatted string), `delta?: { value, label }`.
Delta hidden when `|value| <= 2`. Colors: emerald-600 (positive), amber-600 (negative).
`font-mono` on value, `font-sans` on label.

---

## Task 4: Monthly Stacked Area Chart

**Files:**
- Create: `src/components/overview/monthly-area-chart.tsx`

Recharts `AreaChart` with two stacked areas (incurred=#0d9488, reversed=#dc2626, fillOpacity=0.3).
Hoisted constants: `COLORS`, `REFERENCE_LINES` (Sep "+41%" amber, Nov "-54%" slate).
Custom tooltip: month full name, incurred, reversed, net — all `font-mono`, comma-formatted.
`onClick` → calls `onMonthClick(yearMonth)` (parent handles the two-key setFilter logic).

---

## Task 5: Formulary Donut Chart

**Files:**
- Create: `src/components/overview/formulary-donut.tsx`

Recharts `PieChart` donut (innerRadius=60%, outerRadius=80%).
Colors: OPEN=#0d9488, MANAGED=#1e3a5f, HMF=#8b5cf6.
Center label: total net claims in `font-mono`.
Tooltip: segment name, net claims, reversal rate %.
`onClick` slice → calls `onSliceClick(type)`.

---

## Task 6: State Horizontal Bars

**Files:**
- Create: `src/components/overview/state-bars.tsx`

Recharts `BarChart` with `layout="vertical"`. All bars teal (#0d9488).
Data pre-sorted by API (netClaims DESC).
Tooltip: state, net claims, total claims, reversal rate %.
`onClick` → calls `onBarClick(state)`.

---

## Task 7: Adjudication Gauge

**Files:**
- Create: `src/components/overview/adjudication-gauge.tsx`

Recharts `PieChart` semicircle (startAngle=180, endAngle=0).
Two segments: adjudicated (teal), not adjudicated (slate).
Center label: rate as "XX.X%" in `font-mono`.
Context note below: unfiltered variant (hardcoded LTC explanation) vs filtered variant (dynamic percentage).

---

## Task 8: Insight Cards Display

**Files:**
- Create: `src/components/overview/insight-cards.tsx`

Renders `InsightCard[]` in a responsive grid.
Left border accent: info=teal-500, warning=amber-500, positive=emerald-500.
Title `font-semibold`, body `text-sm text-muted-foreground`.

---

## Task 9: Executive Overview Page (Orchestrator)

**Files:**
- Modify: `src/app/page.tsx` (replace placeholder entirely)

This is the main integration task:

1. **Data fetching**: `useEffect` + `fetch` to `/api/overview` with query string from `useFilters()`. Loading/error/empty states.
2. **Dynamic imports**: All 4 chart components via `next/dynamic({ ssr: false })` with Skeleton loaders.
3. **Delta computation**: Pure function, hardcoded dimension counts (5/3/4/12). Rate metrics compare directly; count metrics divide by dimension count for "vs avg". Multi-dimension → "vs total".
4. **Month click handler**: Two `setFilter` calls (dateStart + dateEnd), coalesced by SPEC-002's 200ms debounce. Toggle: check `filters.dateStart` matches, then two `removeFilter` calls.
5. **Grid layout**: 4-col KPI row → 7-col row (4/7 hero + 3/7 donut) → 2-col row (bars + gauge) → insight cards.
6. **Skeleton loading**: Every section has skeleton state. No blank screens.
7. **Empty state**: "No data matches current filters" + clear-filters button.

---

## Task 10: Type-Check + Commit

**Commands:**
```bash
npx tsc --noEmit
git add src/lib/format.ts src/lib/generate-insights.ts src/components/overview/ src/app/page.tsx
git commit -m "feat(SPEC-003): Executive Overview — KPIs, charts, insights"
```

---

## Parallelization Map

```
Batch 1 (parallel): Task 1 + Task 2
Batch 2 (parallel): Tasks 3-8 (all chart components)
Batch 3 (sequential): Task 9 (page.tsx — depends on all above)
Batch 4 (sequential): Task 10 (verify + commit)
```

## Key Decisions

1. **Rate metrics delta**: `reversalRate` compares directly against unfiltered (not divided by dimension count — dividing a percentage by 5 is meaningless)
2. **Month data format**: API returns `"YYYY-MM"`. Click handler builds `"YYYY-MM-01"` and `"YYYY-MM-DD"` (last day).
3. **No external fetching lib**: Inline `useEffect` + `fetch` per spec. Cancellation via `cancelled` flag.
4. **Recharts v3**: API is largely v2-compatible. `ResponsiveContainer`, `Label` content prop for center labels.
5. **Insight fallback**: Generic "filtered view" insight if no specific template matches — ensures 1-3 cards always show.
