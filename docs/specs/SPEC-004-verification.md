# Verification: SPEC-004 — Claims Explorer Page

**Verified:** 2026-02-20
**Verifier:** Mac (reviewer machine — did not write the implementation)
**Implementation by:** Framework Desktop

---

## Goal Statement

**What must be TRUE for SPEC-004 to be done?**

A user navigating to `/explorer` sees a fully interactive Claims Explorer page with: a compact monthly trend chart, a sortable/paginated drugs table, Days Supply histogram, MONY donut, Top 10 Groups bars, Top 10 Manufacturers bars, and dynamic insight cards — all driven by the `/api/claims` endpoint and responsive to global filter state via `useFilters()`.

---

## AC Verification

| AC                                                                                                                                                    | Exists | Substantive | Wired | Verdict  | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- | ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------------------------------------------------------------------- |
| **1** — Page at `/explorer` fetches `/api/claims` and renders all sections                                                                            | YES    | YES         | YES   | **PASS** | `explorer/page.tsx` fetches via `fetch(/api/claims?${queryString})`. Screenshot confirms all 7 sections render.                                                                                                                                                                                                                                                                                                                                       |
| **2** — Re-fetches when filters change                                                                                                                | YES    | YES         | YES   | **PASS** | `queryString` useMemo depends on `[filters, limit]`; `useEffect` depends on `[queryString]`. Changing any filter triggers re-fetch.                                                                                                                                                                                                                                                                                                                   |
| **3** — FilterBar with `view="explorer"`                                                                                                              | YES    | YES         | YES   | **PASS** | `<FilterBar view="explorer" />` at line 242. Screenshots show filter bar with Formulary, State, MONY, Drugs, Manufacturers, Groups dropdowns + active filter chips (CA, MONY Y).                                                                                                                                                                                                                                                                      |
| **4** — Mini monthly trend (~150px stacked area)                                                                                                      | YES    | YES         | YES   | **PASS** | `mini-trend.tsx`: `AreaChart` with incurred (#0d9488 teal) and reversed (#dc2626 red), `stackId="1"`. Container `h-36` (144px ≈ 150px). Screenshot confirms compact area chart.                                                                                                                                                                                                                                                                       |
| **4a** — Month click toggles date filter                                                                                                              | YES    | YES         | YES   | **PASS** | `handleMonthClick` in page.tsx toggles `dateStart`/`dateEnd` via `setFilter`/`removeFilter`, uses `getLastDayOfMonth()` — same behavior as SPEC-003 hero chart.                                                                                                                                                                                                                                                                                       |
| **5** — Drugs table: 6 columns (drugName, NDC, netClaims, reversalRate, formulary, topState)                                                          | YES    | YES         | YES   | **PASS** | `drugs-table.tsx` defines all 6 columns with proper accessorKeys and cell renderers. Screenshot confirms all columns visible with data.                                                                                                                                                                                                                                                                                                               |
| **6** — Sortable by column headers (Net Claims desc default)                                                                                          | YES    | YES         | YES   | **PASS** | Default sort state `{ id: 'netClaims', desc: true }`. Headers have `ArrowUp`/`ArrowDown`/`ArrowUpDown` toggle icons. `getSortedRowModel()` from @tanstack/react-table.                                                                                                                                                                                                                                                                                |
| **7** — Pagination: Top 20 / Top 50 toggle                                                                                                            | YES    | YES         | YES   | **PASS** | `limit` state + "Top 20" / "Top 50" buttons in DrugsTable footer. Active button uses `variant="default"`. `limit` passed to API query string. Screenshot shows both buttons.                                                                                                                                                                                                                                                                          |
| **8** — Click drug row toggles drug filter                                                                                                            | YES    | YES         | YES   | **PASS** | `TableRow onClick={() => handleRowClick(row.original.drugName)}`. `handleDrugClick` toggles `drug` filter. Active row gets `bg-teal-50` highlight via `activeDrug` prop.                                                                                                                                                                                                                                                                              |
| **9** — Days Supply histogram with bins                                                                                                               | YES    | YES         | YES   | **PASS** | `days-supply-chart.tsx`: vertical `BarChart` with teal bars (#0d9488), tooltips showing bin + count. Screenshot confirms bars render. Click is visual-only (per spec).                                                                                                                                                                                                                                                                                |
| **10** — MONY donut with full labels + clickable slices                                                                                               | YES    | YES         | YES   | **PASS** | `mony-donut.tsx`: `PieChart` donut (innerRadius 55%, outerRadius 80%). `MONY_LABELS` map provides full labels ("Multi-Source Brand", etc.). Center `Label` shows total. `onClick` handler calls `onSliceClick(type)`. Screenshot shows donut with 426K/125K/358K center labels across views.                                                                                                                                                          |
| **11** — Top 10 Groups horizontal bars + click toggles group filter                                                                                   | YES    | YES         | YES   | **PASS** | `top-groups-chart.tsx`: horizontal `BarChart`, navy (#1e3a5f), `layout="vertical"`. `onClick` extracts `groupId` and calls `onBarClick`. Page wires to `handleGroupClick` which toggles `groupId` filter. Screenshot confirms.                                                                                                                                                                                                                        |
| **12** — Top 10 Manufacturers horizontal bars + click toggles manufacturer filter                                                                     | YES    | YES         | YES   | **PASS** | `top-manufacturers-chart.tsx`: horizontal `BarChart`, violet (#8b5cf6), truncated labels (16 chars + "..."). `onClick` extracts `manufacturer` and calls `onBarClick`. Page wires to `handleManufacturerClick`. Screenshot confirms violet bars.                                                                                                                                                                                                      |
| **13** — Reversal rate amber (>15%) / red (>20%)                                                                                                      | YES    | YES         | YES   | **PASS** | `ReversalRateCell`: `value > 20 → text-red-600 font-semibold`, `value > 15 → text-amber-600 font-semibold`. Used in column def for reversalRate.                                                                                                                                                                                                                                                                                                      |
| **14** — 1-3 insight cards; ≥10 templates (3+ unfiltered, 1+ per-drug, 1+ per-manufacturer, 2+ per-MONY, 1+ per-group, 1+ per-state, 1+ combinations) | YES    | YES         | YES   | **PASS** | 14 explorer templates in `generate-insights.ts`: unfiltered (3: exp-generic-mix, exp-supply-cycles, exp-top-drug-profile), per-drug (1: exp-drug-detail), per-manufacturer (1: exp-manufacturer-detail), per-MONY (4: exp-mony-y/n/o/m), per-group (1: exp-group-detail), per-state (1: exp-state-detail), combinations (2: exp-state-mony-combo, exp-drug-state-combo), fallback (1: exp-fallback). Screenshots confirm 3 cards render in each view. |
| **15** — Skeleton loading states for all elements                                                                                                     | YES    | YES         | YES   | **PASS** | `ChartSkeleton` + `TableSkeleton` components. Loading gate: `if (loading                                                                                                                                                                                                                                                                                                                                                                              |     | !data)` renders full skeleton layout with shimmer cards for every section. |
| **16** — Empty/filtered state with clear-filters nudge                                                                                                | YES    | YES         | YES   | **PASS** | `if (data.kpis.totalClaims === 0)` shows "No data matches current filters" + "Try removing some filters..." + "Clear All Filters" button. DrugsTable also has "No drugs match current filters" row.                                                                                                                                                                                                                                                   |
| **17** — Number formatting: commas, one-decimal %, Geist Mono                                                                                         | YES    | YES         | YES   | **PASS** | `formatNumber`, `formatPercent`, `abbreviateNumber` used throughout. `font-mono` class on numeric cells (NDC, netClaims, reversalRate, topState in table; tooltip values; insight card values).                                                                                                                                                                                                                                                       |

---

## Stub Detection

Scanned all 7 component files + page.tsx + generate-insights.ts explorer section:

- **TODOs / FIXME / PLACEHOLDER**: None found
- **Empty function bodies**: None
- **Hardcoded sample data**: None — all data flows from API response
- **Console.log debugging**: None
- **Commented-out code**: None

**Result: CLEAN**

---

## Scope Creep

Checked against non-goals:

| Non-Goal                                              | Violated? | Evidence                     |
| ----------------------------------------------------- | --------- | ---------------------------- |
| Executive Overview page (SPEC-003)                    | No        | Explorer page only           |
| Anomalies page                                        | No        | Not touched                  |
| API route implementation (SPEC-001)                   | No        | Consumed, not modified       |
| FilterBar implementation (SPEC-002)                   | No        | Consumed, not modified       |
| Advanced table features (resize, select, inline edit) | No        | Basic sort + pagination only |
| Drill-down to individual claims                       | No        | Not implemented              |
| Mobile/responsive layout                              | No        | Desktop only                 |
| Export or download                                    | No        | Not implemented              |
| KPI summary row                                       | No        | Not added                    |
| Dark mode theming                                     | No        | Not added                    |
| Days Supply as filter dimension                       | No        | Visual highlight only        |

**Result: No scope creep detected**

---

## Browser Test

Playwright headless Chromium (1440×2400 viewport) against `sps-case-study.vercel.app/explorer`:

### Unfiltered (`/explorer`)

- Monthly Trend: stacked area chart renders, all 12 months visible
- Top Drugs table: 20 rows, all 6 columns, sort icons visible
- Days Supply Distribution: bar chart with labeled bins
- MONY Donut: 4 segments, center label "426K", legend with full labels
- Top 10 Groups: horizontal navy bars with group IDs
- Top 10 Manufacturers: horizontal violet bars with truncated names
- Insight cards (3): "Heavy Generic Utilization", "Short-Cycle Dispensing", "Top Drug Profile"
- Console errors: **0**

### Filtered by State=CA (`/explorer?state=CA`)

- FilterBar shows CA chip + "Clear All" button
- All charts update to CA-only data
- MONY donut center: 125K (reduced from 426K)
- Insight cards update: "Short-Cycle Dispensing", "Top Drug Profile", "CA Explorer"
- Console errors: **0**

### Filtered by MONY=Y (`/explorer?mony=Y`)

- FilterBar shows "Y-Single Source Gen..." chip
- MONY donut shows single segment, center: 358K
- All charts update to MONY Y-only data
- Insight cards update: "Short-Cycle Dispensing", "Top Drug Profile", "Single-Source Generics (Y)"
- Console errors: **0**

---

## Regression Note

Framework's SPEC-004 push re-introduced the `overview-fallback` template (id: `overview-fallback`, priority 100) in `generate-insights.ts` that was previously removed during SPEC-003 refinement. This shows a generic "Filtered View" card on the Overview page for any filter combination not covered by specific templates. **This is a SPEC-003 regression, not a SPEC-004 issue.** Should be addressed separately.

---

## Overall: PASS

All 17 acceptance criteria pass the three-level verification (Exists / Substantive / Wired). No stubs, no scope creep, no console errors. Browser test confirms all sections render correctly and respond to filter changes. Implementation is production-quality.
