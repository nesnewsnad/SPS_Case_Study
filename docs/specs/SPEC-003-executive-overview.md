# SPEC-003 — Executive Overview Page

**Date:** 2026-02-19
**Status:** DRAFT
**Dependencies:** SPEC-001 (API routes + types), SPEC-002 (FilterContext + FilterBar)
**Context:** DISCUSS-001 decisions #2, #3, #4, #6; Design doc View 1

---

## Problem

The Executive Overview is the landing page — the first thing the evaluator sees. It must immediately communicate domain fluency, analytical depth, and production quality. It consumes `GET /api/overview` (SPEC-001) and renders KPIs, charts, and dynamic insight cards that respond to the global filter state (SPEC-002). Nothing exists yet beyond a placeholder `page.tsx`.

---

## Behavior

### Page Structure

```
┌─────────────────────────────────────────────────────┐
│ FilterBar (sticky, view="overview")     [SPEC-002]  │
├─────────────────────────────────────────────────────┤
│ Page Header                                         │
├───────────┬───────────┬───────────┬─────────────────┤
│ KPI Card  │ KPI Card  │ KPI Card  │ KPI Card        │
│ Total     │ Net       │ Reversal  │ Unique          │
│ Claims    │ Claims    │ Rate      │ Drugs           │
├───────────┴───────────┴───────────┴─────────────────┤
│                                                     │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │ Hero Chart (4/7)     │  │ Formulary Donut     │  │
│  │ Stacked Area:        │  │ (3/7)               │  │
│  │ Incurred vs Reversed │  │ OPEN/MANAGED/HMF    │  │
│  │ + reference lines    │  │ Clickable slices     │  │
│  └──────────────────────┘  └─────────────────────┘  │
│                                                     │
│  ┌──────────────────────┐  ┌─────────────────────┐  │
│  │ State Bars (1/2)     │  │ Adjudication Gauge  │  │
│  │ Horizontal bars      │  │ (1/2)               │  │
│  │ CA, IN, PA, KS, MN   │  │ Semicircle arc      │  │
│  │ Clickable bars       │  │ 75% non-adjudicated  │  │
│  └──────────────────────┘  └─────────────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ Dynamic Insight Cards                        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Page Header

- Title: **"Executive Overview"** (text-2xl font-semibold)
- Subtitle: **"Pharmacy A — 2021 Claims Utilization Summary"** (text-sm text-muted-foreground)
- No additional controls — filter bar handles all interaction

### Data Fetching

Single fetch to `GET /api/overview` with current filter params from `useFilters()`:

```typescript
const { filters } = useFilters();
// Build query string from filters, fetch /api/overview?state=CA&...
// Returns OverviewResponse (see SPEC-001)
```

- Fetch on mount and re-fetch whenever `filters` changes
- While loading: render skeleton shimmers for every card and chart (no blank screens)
- On error: render error state with retry button
- Implementation detail: use `useEffect` + `fetch` or a lightweight wrapper — no external data-fetching library required

### KPI Row (4 cards)

Four cards in a responsive grid (`grid grid-cols-4 gap-4`):

| Card | Value Source | Format | Icon/Color |
|------|-------------|--------|------------|
| Total Claims | `kpis.totalClaims` | Comma-separated (596,437) | Neutral slate |
| Net Claims | `kpis.netClaims` | Comma-separated (~536K) | Teal |
| Reversal Rate | `kpis.reversalRate` | One-decimal % (10.1%) | Amber if > 10% |
| Unique Drugs | `kpis.uniqueDrugs` | Comma-separated (5,640) | Neutral slate |

**Card anatomy:**
- Label: dimension name in Geist Sans text-sm text-muted-foreground
- Value: hero number in Geist Mono text-2xl font-bold
- Delta indicator (when filters active): small text below the value

**Delta indicators** (DISCUSS-001 decision #6):
- Shown ONLY when at least one filter is active (besides entityId)
- Formula: `((filteredValue - unfilteredAvg) / unfilteredAvg * 100).toFixed(1)`
- `unfilteredAvg` = `unfilteredKpis.totalClaims / dimensionCount` where dimensionCount depends on the active filter dimension (5 for state, 3 for formulary, 4 for MONY, 12 for month)
- When multiple filters active, compare against full unfiltered value instead of per-dimension average
- Positive delta: `"↑ 23.4% vs avg"` in emerald (#059669)
- Negative delta: `"↓ 12.1% vs avg"` in amber (#d97706)
- Near zero (±2%): no delta shown

### Hero Chart — Monthly Stacked Area (Row 2, 4/7 width)

Recharts `AreaChart` with two stacked series:

- **Incurred claims** (teal #0d9488, filled area with 0.3 opacity)
- **Reversed claims** (red #dc2626, filled area with 0.3 opacity, stacked on top)
- X-axis: months (Jan 2021 – Dec 2021), formatted as "Jan", "Feb", etc.
- Y-axis: abbreviated (50K, 60K, 70K)
- Data source: `monthly[]` array from OverviewResponse

**Reference lines:**
- **September spike:** Vertical reference line at Sep 2021, amber (#d97706), dashed, with label "▲ +57%" positioned above
- **November dip:** Vertical reference line at Nov 2021, slate (#64748b), dashed, with label "▼ -49%" positioned above
- **May (when flagged NDCs excluded):** May bar will be near-zero (~5 claims). No special annotation needed — the visual emptiness speaks for itself and the Anomalies page explains it. When flagged NDCs ARE included, May spikes to ~49K — the dramatic reshape is the demonstration.
- Reference lines always visible regardless of filter state (they're annotations, not data)

**Cross-filtering:**
- Click a month data point → `toggleFilter('dateStart', 'YYYY-MM-01')` and `toggleFilter('dateEnd', 'YYYY-MM-DD')` where DD is last day of month
- Simpler alternative at implementor's discretion: clicking a month sets both dateStart and dateEnd to bracket that month

**Tooltip:**
- Geist Mono
- Shows month (full name), incurred count, reversed count, net count
- Formatted with commas

**Card wrapper:** shadcn/ui `Card` with title "Monthly Claims Volume" and subtitle "Incurred vs. Reversed"

### Formulary Donut (Row 2, 3/7 width)

Recharts `PieChart` as a donut:

- Three segments: OPEN, MANAGED, HMF
- Data source: `formulary[]` from OverviewResponse, using `netClaims` for segment size
- Colors: teal (#0d9488), navy (#1e3a5f), violet (#8b5cf6)
- Inner radius ~60%, outer radius ~80% (donut, not pie)
- Center label: total net claims in Geist Mono

**Cross-filtering:**
- Click a slice → `toggleFilter('formulary', type)`

**Tooltip:**
- Segment name, net claims (formatted), reversal rate %

**Card wrapper:** `Card` with title "Formulary Mix"

### State Horizontal Bars (Row 3, 1/2 width)

Recharts `BarChart` with horizontal layout:

- 5 bars: CA, IN, PA, KS, MN
- Data source: `states[]` from OverviewResponse, sorted by `netClaims` descending
- Bar color: teal (#0d9488) for all states
- No special KS highlighting — EDA confirmed KS reversal rates are ~10% (same as all states) when the August batch event is understood. The KS story belongs on the Anomalies page, not here.
- Y-axis: state abbreviations
- X-axis: net claims, abbreviated (50K, 100K)

**Cross-filtering:**
- Click a bar → `toggleFilter('state', stateAbbr)`

**Tooltip:**
- State name, net claims, total claims, reversal rate %

**Card wrapper:** `Card` with title "Claims by State"

### Adjudication Gauge (Row 3, 1/2 width)

Custom Recharts `PieChart` gauge (DISCUSS-001 decision #4):

- Semicircle: `startAngle={180}` / `endAngle={0}`
- Two segments: adjudicated (teal) and not adjudicated (slate #64748b)
- Data source: `adjudication` from OverviewResponse
- Center label: `adjudication.rate` formatted as "XX.X%" in Geist Mono text-xl
- Below the gauge: "Adjudicated at Point of Sale" label

**Context note** beneath the chart:
> "75% of claims were not adjudicated at point of sale — typical for long-term care (LTC) pharmacies where claims are often processed retrospectively."

- Rendered in text-sm text-muted-foreground, max-width for readability
- Note adjusts if filters change the rate significantly (e.g., "In [state], XX% were not adjudicated...")

**Card wrapper:** `Card` with title "Adjudication Rate"

### Dynamic Insight Cards

Below the charts. 1-3 cards depending on filter state. Each card:

```typescript
interface InsightCard {
  title: string;
  body: string;
  severity: "info" | "warning" | "positive";
}
```

**Visual:**
- Left border accent: info = teal, warning = amber, positive = emerald
- Title in font-semibold, body in text-sm text-muted-foreground
- Consultant-analyst tone throughout

**Insight generation** (DISCUSS-001 decision #3):
- `generateInsights(filters, data): InsightCard[]` utility in `src/lib/generate-insights.ts`
- Template-based, no LLM — interpolates real values from the API response
- Most-specific match wins: if state=KS is filtered, show KS-specific insight over generic

**Template categories for Overview:**

| Condition | Example Insight |
|-----------|----------------|
| No filters | "Pharmacy A processed ~546K claims in 2021 with a 10.8% reversal rate across 5,639 unique drugs — a utilization profile consistent with large-scale LTC pharmacy operations." |
| No filters | "100% of claims dispensed through retail channels. No mail-order volume — consistent with LTC pharmacy distribution. All 189 groups are state-specific (no group spans multiple states)." |
| No filters | "First-of-month cycle fills run 7-8x average daily volume — a strong LTC signal where facilities batch-dispense on day 1 of each cycle." |
| State = CA | "California represents the largest claims volume at XXK net claims. As the primary state, CA volume trends will disproportionately influence overall metrics." |
| State = KS | "Kansas shows a normal ~10% reversal rate in most months. However, August is a major outlier — 18 KS-only groups were fully reversed (81.6% rate), then re-incurred in September. See Anomalies for the full investigation." |
| Formulary = any | "Under the [type] formulary, reversal rates are X.X% with XXK net claims — essentially in line with the ~10.8% overall average. Formulary type shows minimal correlation with reversal behavior." |
| Month = Sep | "September claims surged 57% above the normal-month average, uniformly across all states and formularies. Partially explained by KS rebill groups re-incurring post-August batch reversal." |
| Month = Nov | "November volume dropped 49% below average — uniformly across all states and groups. All 30 days are present; this is not missing data. Root cause requires clarification." |
| Month = May (flagged off) | "May shows near-zero claims because a synthetic test drug (KRYPTONITE XR) was excluded. Toggle 'Include flagged NDCs' to see its impact, or visit the Anomalies page." |
| MONY = Y | "Single-source generics (MONY Y) account for 77% of claims — heavily generic, consistent with aggressive LTC formulary management." |
| Multiple filters | Combine relevant insights, show the most specific first, max 3 cards |

Implementor writes ~15-20 templates. Exact wording at discretion — the tone and data-grounding are the requirements, not the verbatim text.

### Loading States

Every visual element has a skeleton placeholder:
- KPI cards: gray shimmer rectangle for value, smaller one for label
- Charts: gray shimmer rectangle matching chart dimensions
- Insight cards: two lines of shimmer text
- Use shadcn/ui `Skeleton` component or Tailwind `animate-pulse` on gray rectangles
- All skeletons render immediately — no blank frame, no spinner

### Empty/Filtered States

If filters produce zero results:
- KPI values show "0" or "—"
- Charts show empty state: centered text "No data matches current filters" in text-muted-foreground
- A nudge below: "Try adjusting or clearing filters" with a link that calls `clearAll()`

---

## File Structure

```
src/
  app/
    page.tsx                          # Executive Overview (updated from placeholder)
  components/
    overview/
      kpi-card.tsx                    # Single KPI card with delta indicator
      monthly-area-chart.tsx          # Hero stacked area chart
      formulary-donut.tsx             # Formulary mix donut
      state-bars.tsx                  # Horizontal bar chart by state
      adjudication-gauge.tsx          # Semicircle gauge chart
      insight-cards.tsx               # Dynamic insight cards container
  lib/
    generate-insights.ts              # Template engine for insight cards
    format.ts                         # Number formatting helpers (commas, %, abbreviate)
```

Component file organization within `overview/` is at implementor's discretion — the above is a suggestion, not a mandate.

---

## Acceptance Criteria

1. Executive Overview page at `/` fetches `GET /api/overview` with current filter params and renders all sections
2. Re-fetches data when filters change (via `useFilters()` from SPEC-002)
3. Four KPI cards display Total Claims, Net Claims, Reversal Rate, and Unique Drugs with correct formatting (commas, one-decimal %)
4. KPI cards show delta indicators ("↑ X% vs avg" / "↓ X% vs avg") when filters are active; no delta when unfiltered
5. Hero stacked area chart renders monthly incurred vs. reversed claims for all 12 months of 2021
6. Hero chart has reference lines for September spike (amber, "+57%") and November dip (slate, "-49%")
7. Clicking a month on the hero chart toggles a date filter via `toggleFilter`
8. Formulary donut renders OPEN/MANAGED/HMF proportions; clicking a slice toggles a formulary filter
9. State horizontal bars render 5 states sorted by net claims descending, all in teal (no special KS highlighting — KS rates are normal outside the August batch event)
10. Clicking a state bar toggles a state filter
11. Adjudication gauge renders as a semicircle with center percentage label and LTC context note beneath
12. 1-3 dynamic insight cards render below charts with filter-responsive content and consultant-analyst tone
13. Skeleton loading states render for all cards and charts while data is loading (no blank screens)
14. Empty/filtered state shows "No data matches current filters" with a clear-filters nudge when no data is returned
15. All numbers use Geist Mono; all labels use Geist Sans
16. Chart tooltips display formatted values (commas, percentages)

---

## Non-Goals

- Claims Explorer view (SPEC-004)
- Anomalies page or anomaly investigation panels
- API route implementation (SPEC-001)
- FilterBar implementation (SPEC-002) — this spec consumes it
- Mobile/responsive layout (desktop only, min 1200px)
- Animation beyond skeleton shimmers and chart fade-in
- Export or download functionality
