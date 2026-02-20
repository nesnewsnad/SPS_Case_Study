# SPEC-001 — API Routes & Shared Types

**Date:** 2026-02-19
**Status:** DRAFT
**Dependencies:** None
**Context:** DISCUSS-001

---

## Problem

The dashboard needs server-side data aggregation. With ~596K claim rows, raw data cannot be sent to the browser. Every view requires pre-aggregated JSON from API routes that accept a unified filter parameter set. No routes exist yet — only the database schema and seed script.

---

## Behavior

Six Next.js App Router API routes under `src/app/api/`. All routes:
- Accept the unified filter query parameters
- Return JSON with `Content-Type: application/json`
- Aggregate data server-side via Drizzle ORM queries against Vercel Postgres
- Scope all queries to `entityId` (default: 1 for Pharmacy A)
- Return `{ error: string }` with appropriate HTTP status on failure

### Unified Filter Parameters

All routes accept these query params (all optional except entityId which defaults to 1):

| Param | Type | Example | Description |
|-------|------|---------|-------------|
| `entityId` | number | `1` | Entity scope (default: 1) |
| `formulary` | string | `OPEN` | OPEN, MANAGED, or HMF |
| `state` | string | `CA` | 2-letter pharmacy state |
| `mony` | string | `O` | M, O, N, or Y |
| `manufacturer` | string | `TEVA` | Manufacturer name (exact match) |
| `drug` | string | `ATORVASTATIN` | Drug name (exact match) |
| `ndc` | string | `12345678901` | National Drug Code |
| `dateStart` | string | `2021-03-01` | YYYY-MM-DD inclusive start |
| `dateEnd` | string | `2021-09-30` | YYYY-MM-DD inclusive end |
| `groupId` | string | `GRP001` | Group identifier |
| `flagged` | string | `true` | Include flagged/test NDCs (default: excluded) |

Filters that reference drug_info fields (`mony`, `manufacturer`, `drug`, `ndc`) require a JOIN to drug_info on `claims.ndc = drug_info.ndc`.

### Shared TypeScript Types

All types exported from `src/lib/api-types.ts`:

```typescript
// Unified filter params (parsed from query string)
export interface FilterParams {
  entityId: number;
  formulary?: string;
  state?: string;
  mony?: string;
  manufacturer?: string;
  drug?: string;
  ndc?: string;
  dateStart?: string;
  dateEnd?: string;
  groupId?: string;
  includeFlaggedNdcs?: boolean;  // default false — excludes FLAGGED_NDCS from all queries
}

// Registry of flagged NDCs — excluded from all queries unless toggled on
export const FLAGGED_NDCS: { ndc: string; label: string; reason: string }[] = [
  { ndc: '65862020190', label: 'KRYPTONITE XR (LEX LUTHER INC.)', reason: 'Synthetic test drug — 49,567 claims, 99.5% in May' }
];

// KPI summary — used by both overview and claims
export interface KpiSummary {
  totalClaims: number;
  netClaims: number;
  reversalRate: number;
  uniqueDrugs: number;
}

// Monthly data point — used by overview hero chart and explorer mini trend
export interface MonthlyDataPoint {
  month: string;       // "2021-01" format
  incurred: number;
  reversed: number;
}

// --- /api/overview ---

export interface FormularyBreakdown {
  type: string;        // "OPEN" | "MANAGED" | "HMF"
  netClaims: number;
  reversalRate: number;
}

export interface StateBreakdown {
  state: string;       // "CA" | "IN" | "PA" | "KS" | "MN"
  netClaims: number;
  totalClaims: number;
  reversalRate: number;
}

export interface AdjudicationSummary {
  adjudicated: number;
  notAdjudicated: number;
  rate: number;        // 0-100, percentage adjudicated
}

export interface OverviewResponse {
  kpis: KpiSummary;
  unfilteredKpis: KpiSummary;
  monthly: MonthlyDataPoint[];
  formulary: FormularyBreakdown[];
  states: StateBreakdown[];
  adjudication: AdjudicationSummary;
}

// --- /api/claims ---

export interface DrugRow {
  drugName: string;
  ndc: string;
  netClaims: number;
  reversalRate: number;
  formulary: string;   // most common formulary for this drug
  topState: string;    // state with most claims for this drug
}

export interface DaysSupplyBin {
  bin: string;         // "7", "14", "30", "60", "90", "Other"
  count: number;
}

export interface MonyBreakdown {
  type: string;        // "M" | "O" | "N" | "Y"
  netClaims: number;
}

export interface GroupVolume {
  groupId: string;
  netClaims: number;
}

export interface ManufacturerVolume {
  manufacturer: string;
  netClaims: number;
}

export interface ClaimsResponse {
  kpis: KpiSummary;
  unfilteredKpis: KpiSummary;
  monthly: MonthlyDataPoint[];
  drugs: DrugRow[];
  daysSupply: DaysSupplyBin[];
  mony: MonyBreakdown[];
  topGroups: GroupVolume[];
  topManufacturers: ManufacturerVolume[];
}

// --- /api/anomalies ---

export interface BeforeAfterMetric {
  metric: string;                // "Total Claims", "May Volume", "Reversal Rate", etc.
  withFlagged: string;           // formatted value with flagged NDCs included
  withoutFlagged: string;        // formatted value with flagged NDCs excluded
}

export interface AnomalyPanel {
  id: string;                    // "kryptonite-xr" | "sept-spike" | "nov-dip" | "ks-aug-batch-reversal"
  title: string;
  keyStat: string;               // "49,567 claims", "+41%", "-54%", "81.6%"
  whatWeSee: string;
  whyItMatters: string;
  toConfirm: string;
  rfpImpact: string;
  miniCharts: AnomalyMiniChart[];
  beforeAfter?: BeforeAfterMetric[];  // Kryptonite panel only — impact comparison
}

export interface AnomalyMiniChart {
  title: string;
  type: "grouped-bar" | "stacked-bar" | "bar";
  data: Record<string, number | string>[];
}

export interface AnomaliesResponse {
  panels: AnomalyPanel[];
}

// --- /api/filters ---

export interface FiltersResponse {
  drugs: string[];
  manufacturers: string[];
  groups: string[];
}

// --- /api/entities ---

export interface Entity {
  id: number;
  name: string;
  description: string | null;
}

export interface EntitiesResponse {
  entities: Entity[];
}
```

### Route Details

#### `GET /api/overview`

Returns `OverviewResponse`. Key query logic:

- **kpis**: COUNT(*) for totalClaims, SUM(net_claim_count) for netClaims, reversal rate = count of net_claim_count=-1 / total * 100, COUNT(DISTINCT ndc) for uniqueDrugs. All respect active filters.
- **unfilteredKpis**: Same 4 KPIs but ignoring all filters except entityId. Always returns the full-dataset baseline.
- **monthly**: GROUP BY date_trunc('month', date_filled). Incurred = SUM where net_claim_count=1, reversed = ABS(SUM where net_claim_count=-1). Sorted chronologically.
- **formulary**: GROUP BY formulary. Net claims and reversal rate per type.
- **states**: GROUP BY pharmacy_state. Net claims, total claims, reversal rate. Sorted by net claims descending.
- **adjudication**: COUNT where adjudicated=true vs. false. Rate = adjudicated / total * 100.

#### `GET /api/claims`

Returns `ClaimsResponse`. Accepts additional query param:
- `limit` (number, default 20) — controls how many drugs to return in the drugs array

Key query logic:

- **kpis + unfilteredKpis**: Same as overview.
- **monthly**: Same as overview (re-calculated with explorer filters).
- **drugs**: JOIN drug_info. GROUP BY drug_name, ndc. Net claims, reversal rate. Formulary = most frequent formulary for that drug (MODE). Top state = state with highest net claims for that drug. Sorted by net claims descending, limited by `limit` param.
- **daysSupply**: CASE statement bucketing days_supply into bins: 7, 14, 30, 60, 90, Other. COUNT per bin.
- **mony**: JOIN drug_info. GROUP BY mony. SUM(net_claim_count) per type.
- **topGroups**: GROUP BY group_id. SUM(net_claim_count). Top 10 by volume.
- **topManufacturers**: JOIN drug_info. GROUP BY manufacturer_name. SUM(net_claim_count). Top 10 by volume.

#### `GET /api/anomalies`

Returns `AnomaliesResponse`. Four pre-computed panels:

- **Kryptonite XR (test drug)**: `id: "kryptonite-xr"`. Always computed regardless of the `includeFlaggedNdcs` toggle. Returns:
  - `beforeAfter[]` with 5 metrics computed **with** and **without** NDC 65862020190: Total Claims, May Volume, Net Claims, Reversal Rate, Unique Drugs. Both values always returned so the panel can show the comparison without the user toggling.
  - `miniCharts`: monthly volume chart showing the Kryptonite-only claims by month (the May spike).
  - NDC details in narrative: drug name, label name, manufacturer, MONY, state/formulary distribution match.

- **September spike**: `id: "sept-spike"`. Monthly totals for comparison (excluding Kryptonite by default), September claims by state (grouped bar), September claims by formulary (stacked bar). `keyStat: "+41%"` (vs. normal-month average excluding May/Nov). Notes partial explanation from KS rebill groups re-incurring in September.

- **November dip**: `id: "nov-dip"`. Monthly totals for comparison, November claims by state, November claims by top 10 groups (ratio vs. their average month). `keyStat: "-54%"`. Notes that the dip is uniform across all states and groups — not caused by missing data or specific groups dropping off.

- **Kansas August batch reversal**: `id: "ks-aug-batch-reversal"`. NOT a general "KS has high reversals" story. Specific drill-down showing:
  - 18 KS-only groups with 100% reversal rate in August (4,790 claims, zero incurred)
  - Jul→Aug→Sep pattern for top affected groups (normal → full reversal → elevated re-incurrence)
  - `keyStat: "81.6%"` (KS August reversal rate)
  - `miniCharts`: KS monthly reversal rates (showing August as the sole outlier), top 5 batch-reversal groups with their Jul/Aug/Sep volume.

Narrative strings (whatWeSee, whyItMatters, toConfirm, rfpImpact) are hardcoded server-side — they reference specific data points but the prose is pre-written. Mini chart data is queried from the database.

Accepts filter params but primarily designed for unfiltered view. Filters narrow the underlying data if applied. The Kryptonite panel always computes both with/without regardless of the `includeFlaggedNdcs` toggle.

#### `GET /api/filters`

Returns `FiltersResponse`. Three queries:
- SELECT DISTINCT drug_name FROM drug_info WHERE ndc IN (SELECT DISTINCT ndc FROM claims WHERE entity_id = ?) ORDER BY drug_name
- SELECT DISTINCT manufacturer_name FROM drug_info WHERE ndc IN (SELECT DISTINCT ndc FROM claims WHERE entity_id = ?) ORDER BY manufacturer_name
- SELECT DISTINCT group_id FROM claims WHERE entity_id = ? ORDER BY group_id

Only returns values that actually appear in claims for this entity. Sorted alphabetically.

#### `GET /api/entities`

Returns `EntitiesResponse`. Simple SELECT from entities table. No filter params needed.

### Shared Query Helper

A `parseFilters(searchParams: URLSearchParams): FilterParams` utility in `src/lib/parse-filters.ts` that:
- Extracts all filter params from the URL search params
- Defaults `entityId` to 1
- Defaults `includeFlaggedNdcs` to `false`; set to `true` only when `?flagged=true` is present
- Returns a typed `FilterParams` object
- Used by every route to avoid duplicating param parsing

A `buildWhereClause(filters: FilterParams)` utility in `src/lib/build-where.ts` that:
- Takes parsed filters and returns Drizzle `where` conditions
- Handles the drug_info JOIN when mony/manufacturer/drug/ndc filters are present
- **When `includeFlaggedNdcs` is false (default):** appends `AND claims.ndc NOT IN (65862020190)` (all NDCs from `FLAGGED_NDCS` registry). This globally excludes synthetic/test drug data.
- **When `includeFlaggedNdcs` is true:** omits the exclusion — all rows included
- Shared across all routes for consistent filter behavior

---

## Acceptance Criteria

1. `src/lib/api-types.ts` exports all TypeScript interfaces listed above
2. `src/lib/parse-filters.ts` exports `parseFilters()` that extracts and validates filter params from URLSearchParams
3. `src/lib/build-where.ts` exports a helper that builds Drizzle where conditions from FilterParams
4. `GET /api/overview` returns valid `OverviewResponse` JSON with correct KPI calculations against seeded data
5. `GET /api/overview?state=CA` returns KPIs filtered to California; `unfilteredKpis` remains the full-dataset baseline
6. `GET /api/claims` returns valid `ClaimsResponse` JSON with top drugs, days supply bins, MONY breakdown, top groups, and top manufacturers
7. `GET /api/claims?limit=50` returns up to 50 drugs instead of the default 20
8. `GET /api/anomalies` returns 4 panels (kryptonite-xr, sept-spike, nov-dip, ks-aug-batch-reversal) with narrative strings and mini chart data arrays
8a. Kryptonite panel includes `beforeAfter[]` with 5 metrics comparing with/without the flagged NDC, regardless of the current `includeFlaggedNdcs` toggle
9. `GET /api/filters` returns sorted arrays of distinct drug names, manufacturers, and group IDs that exist in claims
10. `GET /api/entities` returns the entities list including Pharmacy A
11. All routes return `{ error: string }` with 400 status for malformed params or 500 for server errors
12. All routes set `Content-Type: application/json`
13. No route returns raw claim rows — all data is aggregated

---

## Non-Goals

- Client-side components or UI (SPEC-002, SPEC-003, SPEC-004)
- FilterContext or URL sync logic (SPEC-002)
- Chart rendering or insight card generation (SPEC-003, SPEC-004)
- Authentication or rate limiting
- Caching headers (can add later as polish)
- Pagination on any endpoint except `limit` on `/api/claims` drugs
