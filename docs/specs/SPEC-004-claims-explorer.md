# SPEC-004 — Claims Explorer Page

**Date:** 2026-02-19
**Status:** DRAFT
**Dependencies:** SPEC-001 (API routes + types), SPEC-002 (FilterContext + FilterBar)
**Context:** DISCUSS-001 decisions #2, #3, #5; Design doc View 2

---

## Problem

The Claims Explorer is the drill-down page where every dimension from the brief is accessible. It consumes `GET /api/claims` (SPEC-001) and renders a drug-centric table, distribution charts, and volume breakdowns — all cross-filterable and responsive to the global filter state (SPEC-002). Nothing exists yet beyond a placeholder `explorer/page.tsx`.

---

## Behavior

### Page Structure

```
┌─────────────────────────────────────────────────────┐
│ FilterBar (sticky, view="explorer")     [SPEC-002]  │
├─────────────────────────────────────────────────────┤
│ Page Header                                         │
├─────────────────────────────────────────────────────┤
│ Mini Monthly Trend (full width, ~150px tall)        │
│ Compact stacked area — temporal context             │
├────────────────┬────────────────┬────────────────────┤
│ Top Drugs      │ Days Supply    │ MONY Breakdown     │
│ Table          │ Histogram      │ Donut              │
│ (sortable,     │ 7/14/30/60/90  │ M/O/N/Y            │
│  paginated)    │ Clickable bars │ Clickable slices    │
├────────────────┴────────────────┴────────────────────┤
│                                                      │
│  ┌─────────────────────┐  ┌────────────────────────┐ │
│  │ Top 10 Groups       │  │ Top 10 Manufacturers   │ │
│  │ Horizontal bars     │  │ Horizontal bars        │ │
│  │ Clickable           │  │ Clickable              │ │
│  └─────────────────────┘  └────────────────────────┘ │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ Dynamic Insight Cards                         │    │
│  └──────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Page Header

- Title: **"Claims Explorer"** (text-2xl font-semibold)
- Subtitle: **"Pharmacy A — Drug-Level Drill-Down & Distribution Analysis"** (text-sm text-muted-foreground)

### Data Fetching

Single fetch to `GET /api/claims` with current filter params:

```typescript
const { filters } = useFilters();
// Build query string from filters + limit param, fetch /api/claims?state=CA&limit=20...
// Returns ClaimsResponse (see SPEC-001)
```

- Fetch on mount and re-fetch whenever `filters` changes
- While loading: skeleton shimmers for every element
- On error: error state with retry button
- Same pattern as SPEC-003 Overview

### Mini Monthly Trend (full width, ~150px tall)

Recharts `AreaChart` — compact version of the Overview hero chart:

- Same data shape: `monthly[]` with incurred and reversed stacked areas
- Teal for incurred, red for reversed (same colors as Overview)
- Simplified axes: X-axis shows abbreviated months, Y-axis hidden or minimal
- Height constrained to ~150px — this is context, not the main content
- No reference lines (those belong on the Overview)

**Cross-filtering:**
- Click a month → same date filter toggle behavior as SPEC-003

**Card wrapper:** `Card` with no title (the chart speaks for itself) or a subtle "Monthly Trend" label

### Top Drugs Table (Column 1)

The centerpiece of the Explorer. A sortable, paginated data table.

**Columns:**

| Column | Source | Format | Sortable |
|--------|--------|--------|----------|
| Drug Name | `drugs[].drugName` | Text, truncate at ~30 chars with tooltip | Yes |
| NDC | `drugs[].ndc` | Monospace | No |
| Net Claims | `drugs[].netClaims` | Comma-separated | Yes (default, desc) |
| Reversal Rate | `drugs[].reversalRate` | One-decimal % | Yes |
| Formulary | `drugs[].formulary` | Badge (OPEN/MANAGED/HMF) | Yes |
| Top State | `drugs[].topState` | 2-letter code | No |

**Behavior:**
- Default sort: Net Claims descending (highest volume first)
- Click column header to sort ascending/descending (toggle)
- Active sort column has a visual indicator (arrow icon)
- Pagination: toggle between "Top 20" / "Top 50" — sends `limit` param to API
- Use shadcn/ui `Table` + custom sort/pagination logic (not a full DataTable library)

**Cross-filtering:**
- Click any row → `toggleFilter('drug', drugName)` — filters the entire page to that drug
- Active/filtered row has a subtle highlight (teal-50 background)

**Reversal rate highlighting:**
- Cells > 15% render in amber text
- Cells > 20% render in red text

**Card wrapper:** `Card` with title "Top Drugs by Volume" and the pagination toggle in the card header

### Days Supply Histogram (Column 2)

Recharts `BarChart` — vertical bars:

- Bins: 7, 14, 30, 60, 90, Other
- Data source: `daysSupply[]` from ClaimsResponse
- Bar color: teal (#0d9488)
- X-axis: bin labels ("7 days", "14 days", etc.)
- Y-axis: count, abbreviated

**Cross-filtering:**
- Click a bar → `toggleFilter('daysSupply', binValue)` — note: daysSupply is not currently in the unified filter params. Cross-filtering on days supply is a visual highlight only (no API re-fetch). The bar gets a selected-state style. If full cross-filtering is desired, this requires a filter param addition to SPEC-001 — defer to implementor's judgment on whether to add it or keep it visual-only.

**Tooltip:**
- Bin label, count (formatted)

**Card wrapper:** `Card` with title "Days Supply Distribution"

### MONY Donut (Column 3)

Recharts `PieChart` as a donut:

- Four segments: M, O, N, Y
- Data source: `mony[]` from ClaimsResponse, using `netClaims` for segment size
- Colors: teal (O - generic multi, largest), navy (M - brand multi), violet (Y - generic single), amber (N - brand single)
- Inner radius ~60%, outer radius ~80%
- Center label: total net claims or percentage of largest segment

**Legend labels** (not just letters):
- M = "Multi-Source Brand"
- O = "Multi-Source Generic"
- N = "Single-Source Brand"
- Y = "Single-Source Generic"

**Cross-filtering:**
- Click a slice → `toggleFilter('mony', type)`

**Tooltip:**
- Full MONY label, net claims (formatted), percentage of total

**Card wrapper:** `Card` with title "Brand vs. Generic Mix (MONY)"

### Three-Column Layout

The table and two charts sit in a three-column grid:
- Drug table: `col-span-2` or wider — it needs room for 6 columns
- Days Supply + MONY: `col-span-1` each, stacked vertically or side by side depending on space

Exact layout proportions at implementor's discretion. The drug table should be the widest element. A reasonable split: table gets ~50% width, days supply and MONY split the other ~50% stacked vertically.

### Top 10 Groups (Bottom Row, 1/2 width)

Recharts `BarChart` with horizontal layout:

- 10 bars: top 10 groups by net claims
- Data source: `topGroups[]` from ClaimsResponse
- Bar color: navy (#1e3a5f)
- Y-axis: group ID labels (truncate if long)
- X-axis: net claims, abbreviated

**Cross-filtering:**
- Click a bar → `toggleFilter('groupId', groupId)`

**Tooltip:**
- Group ID, net claims (formatted)

**Card wrapper:** `Card` with title "Top 10 Groups by Volume"

### Top 10 Manufacturers (Bottom Row, 1/2 width)

Recharts `BarChart` with horizontal layout:

- 10 bars: top 10 manufacturers by net claims
- Data source: `topManufacturers[]` from ClaimsResponse
- Bar color: violet (#8b5cf6)
- Y-axis: manufacturer names (truncate if long, tooltip on hover)
- X-axis: net claims, abbreviated

**Cross-filtering:**
- Click a bar → `toggleFilter('manufacturer', manufacturer)`

**Tooltip:**
- Manufacturer name, net claims (formatted)

**Card wrapper:** `Card` with title "Top 10 Manufacturers by Volume"

### Dynamic Insight Cards

Same system as SPEC-003 — `generateInsights(filters, data)` returns 1-3 cards.

**Template categories for Explorer:**

| Condition | Example Insight |
|-----------|----------------|
| No filters | "Generics (MONY O+Y) account for X% of claims, consistent with aggressive formulary management and LTC generic utilization targets." |
| No filters | "Short-duration supplies dominate — 7-day and 14-day fills account for X% of claims, reflecting LTC dispensing patterns where medications are reviewed and adjusted frequently." |
| Drug filtered | "[Drug Name] accounts for XXK net claims with a X.X% reversal rate. This drug is primarily dispensed under [formulary] formulary in [state]." |
| Manufacturer filtered | "[Manufacturer] supplies X drugs representing XXK net claims. Generic concentration is X%." |
| MONY = O | "Multi-source generics (MONY O) represent the largest category at X% of net claims — a strong indicator of formulary-driven generic substitution." |
| MONY = N | "Single-source brands (MONY N) account for X% of claims — these represent drugs with no generic alternative and typically carry higher costs." |
| Group filtered | "Group [ID] represents XXK net claims with X unique drugs. Reversal rate is X.X%, [above/below] the overall average." |
| State filtered | "[State] accounts for X% of explorer claims with X unique drugs dispensed." |

Implementor writes ~10-15 templates. Consultant-analyst tone. Data-grounded.

### Loading States

Same pattern as SPEC-003:
- Drug table: skeleton rows (5-6 gray shimmer rows)
- Charts: gray shimmer rectangles
- Insight cards: shimmer text lines
- All render immediately, no blank frame

### Empty/Filtered States

Same pattern as SPEC-003:
- Table shows "No drugs match current filters" with clear-filters nudge
- Charts show centered empty-state text
- Insight cards hidden when no data

---

## File Structure

```
src/
  app/
    explorer/
      page.tsx                        # Claims Explorer (updated from placeholder)
  components/
    explorer/
      mini-trend.tsx                  # Compact monthly area chart
      drugs-table.tsx                 # Sortable, paginated drugs table
      days-supply-chart.tsx           # Days supply histogram
      mony-donut.tsx                  # MONY breakdown donut
      top-groups-chart.tsx            # Top 10 groups horizontal bars
      top-manufacturers-chart.tsx     # Top 10 manufacturers horizontal bars
```

Component file organization is at implementor's discretion.

---

## Acceptance Criteria

1. Claims Explorer page at `/explorer` fetches `GET /api/claims` with current filter params and renders all sections
2. Re-fetches data when filters change (via `useFilters()` from SPEC-002)
3. FilterBar renders with `view="explorer"` showing all overview dropdowns plus searchable Drug Name, Manufacturer, and Group ID comboboxes
4. Mini monthly trend chart renders a compact stacked area for all 12 months
5. Top Drugs table displays drugName, NDC, netClaims, reversalRate, formulary, and topState columns
6. Drug table is sortable by clicking column headers (Net Claims descending by default)
7. Drug table supports pagination toggle between Top 20 and Top 50
8. Clicking a drug table row toggles a drug filter
9. Days Supply histogram renders bins for 7, 14, 30, 60, 90, and Other
10. MONY donut renders four segments with full labels (not just letters) and clickable slices toggle MONY filter
11. Top 10 Groups horizontal bars render and clicking a bar toggles a group filter
12. Top 10 Manufacturers horizontal bars render and clicking a bar toggles a manufacturer filter
13. Reversal rate cells in the drug table highlight amber (>15%) or red (>20%)
14. 1-3 dynamic insight cards render below charts with filter-responsive content
15. Skeleton loading states for all elements while data loads
16. Empty/filtered state shows clear-filters nudge when no data matches
17. All numbers formatted: commas, one-decimal percentages, Geist Mono for values

---

## Non-Goals

- Executive Overview page (SPEC-003)
- Anomalies page or investigation panels
- API route implementation (SPEC-001)
- FilterBar implementation (SPEC-002) — this spec consumes it
- Advanced table features (column resizing, row selection, inline editing)
- Drill-down from drug to individual claims (no row-level claim data in the browser)
- Mobile/responsive layout
- Export or download
