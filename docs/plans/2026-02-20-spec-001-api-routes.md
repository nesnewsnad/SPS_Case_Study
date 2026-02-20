# SPEC-001: API Routes & Shared Types — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build all 6 API routes + shared utilities (types, filter parser, where-clause builder) for the SPS Health claims dashboard.

**Architecture:** Next.js App Router API routes at `src/app/api/*/route.ts`. Shared types in `src/lib/api-types.ts`, filter parsing in `src/lib/parse-filters.ts`, Drizzle where-clause builder in `src/lib/build-where.ts`. All queries run server-side against Vercel Postgres (Neon) via Drizzle ORM. Every query is scoped by `entityId` and excludes flagged NDCs by default.

**Tech Stack:** Next.js 14, Drizzle ORM, Neon Postgres, TypeScript

---

## Task 1: Shared Types (`src/lib/api-types.ts`)

**Files:**
- Create: `src/lib/api-types.ts`

**Step 1: Create the types file**

Write all TypeScript interfaces and the `FLAGGED_NDCS` registry exactly as specified in SPEC-001. This is a pure types file with one const export — no logic, no tests needed.

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
  includeFlaggedNdcs?: boolean;
}

export const FLAGGED_NDCS: { ndc: string; label: string; reason: string }[] = [
  { ndc: '65862020190', label: 'KRYPTONITE XR (LEX LUTHER INC.)', reason: 'Synthetic test drug — 49,567 claims, 99.5% in May' }
];

export interface KpiSummary {
  totalClaims: number;
  netClaims: number;
  reversalRate: number;
  uniqueDrugs: number;
}

export interface MonthlyDataPoint {
  month: string;       // "2021-01" format
  incurred: number;
  reversed: number;
}

export interface FormularyBreakdown {
  type: string;
  netClaims: number;
  reversalRate: number;
}

export interface StateBreakdown {
  state: string;
  netClaims: number;
  totalClaims: number;
  reversalRate: number;
}

export interface AdjudicationSummary {
  adjudicated: number;
  notAdjudicated: number;
  rate: number;
}

export interface OverviewResponse {
  kpis: KpiSummary;
  unfilteredKpis: KpiSummary;
  monthly: MonthlyDataPoint[];
  formulary: FormularyBreakdown[];
  states: StateBreakdown[];
  adjudication: AdjudicationSummary;
}

export interface DrugRow {
  drugName: string;
  ndc: string;
  netClaims: number;
  reversalRate: number;
  formulary: string;
  topState: string;
}

export interface DaysSupplyBin {
  bin: string;
  count: number;
}

export interface MonyBreakdown {
  type: string;
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

export interface BeforeAfterMetric {
  metric: string;
  withFlagged: string;
  withoutFlagged: string;
}

export interface AnomalyPanel {
  id: string;
  title: string;
  keyStat: string;
  whatWeSee: string;
  whyItMatters: string;
  toConfirm: string;
  rfpImpact: string;
  miniCharts: AnomalyMiniChart[];
  beforeAfter?: BeforeAfterMetric[];
}

export interface AnomalyMiniChart {
  title: string;
  type: "grouped-bar" | "stacked-bar" | "bar";
  data: Record<string, number | string>[];
}

export interface AnomaliesResponse {
  panels: AnomalyPanel[];
}

export interface FiltersResponse {
  drugs: string[];
  manufacturers: string[];
  groups: string[];
}

export interface Entity {
  id: number;
  name: string;
  description: string | null;
}

export interface EntitiesResponse {
  entities: Entity[];
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit src/lib/api-types.ts` (or just `npx tsc --noEmit` for whole project)
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/api-types.ts
git commit -m "feat(api): add shared TypeScript types and FLAGGED_NDCS registry"
```

---

## Task 2: Filter Parser (`src/lib/parse-filters.ts`)

**Files:**
- Create: `src/lib/parse-filters.ts`

**Step 1: Write parseFilters**

```typescript
import type { FilterParams } from './api-types';

export function parseFilters(searchParams: URLSearchParams): FilterParams {
  return {
    entityId: Number(searchParams.get('entityId')) || 1,
    formulary: searchParams.get('formulary') ?? undefined,
    state: searchParams.get('state') ?? undefined,
    mony: searchParams.get('mony') ?? undefined,
    manufacturer: searchParams.get('manufacturer') ?? undefined,
    drug: searchParams.get('drug') ?? undefined,
    ndc: searchParams.get('ndc') ?? undefined,
    dateStart: searchParams.get('dateStart') ?? undefined,
    dateEnd: searchParams.get('dateEnd') ?? undefined,
    groupId: searchParams.get('groupId') ?? undefined,
    includeFlaggedNdcs: searchParams.get('flagged') === 'true',
  };
}
```

Key behaviors:
- `entityId` defaults to `1` when missing or non-numeric
- `includeFlaggedNdcs` is `true` only when `?flagged=true` — anything else (missing, "false", "1") → `false`
- All string filters return `undefined` when absent (not `null`)

**Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/parse-filters.ts
git commit -m "feat(api): add parseFilters utility for unified query param extraction"
```

---

## Task 3: Where-Clause Builder (`src/lib/build-where.ts`)

**Files:**
- Create: `src/lib/build-where.ts`

**Step 1: Write buildWhereClause**

This is the most complex shared utility. It takes `FilterParams` and returns Drizzle `where` conditions + a flag indicating if drug_info JOIN is needed.

```typescript
import { and, eq, gte, lte, notInArray, sql, SQL } from 'drizzle-orm';
import { claims, drugInfo } from '@/db/schema';
import type { FilterParams } from './api-types';
import { FLAGGED_NDCS } from './api-types';

export interface WhereResult {
  where: SQL | undefined;
  needsJoin: boolean;
}

export function buildWhereClause(filters: FilterParams): WhereResult {
  const conditions: SQL[] = [];
  let needsJoin = false;

  // Always scope by entity
  conditions.push(eq(claims.entityId, filters.entityId));

  // Flagged NDC exclusion (default: exclude)
  if (!filters.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
    conditions.push(notInArray(claims.ndc, FLAGGED_NDCS.map(f => f.ndc)));
  }

  // Claims-table filters
  if (filters.formulary) conditions.push(eq(claims.formulary, filters.formulary));
  if (filters.state) conditions.push(eq(claims.pharmacyState, filters.state));
  if (filters.groupId) conditions.push(eq(claims.groupId, filters.groupId));
  if (filters.ndc) conditions.push(eq(claims.ndc, filters.ndc));
  if (filters.dateStart) conditions.push(gte(claims.dateFilled, filters.dateStart));
  if (filters.dateEnd) conditions.push(lte(claims.dateFilled, filters.dateEnd));

  // Drug-info filters (require JOIN)
  if (filters.mony) {
    needsJoin = true;
    conditions.push(eq(drugInfo.mony, filters.mony));
  }
  if (filters.manufacturer) {
    needsJoin = true;
    conditions.push(eq(drugInfo.manufacturerName, filters.manufacturer));
  }
  if (filters.drug) {
    needsJoin = true;
    conditions.push(eq(drugInfo.drugName, filters.drug));
  }

  return {
    where: conditions.length > 0 ? and(...conditions) : undefined,
    needsJoin,
  };
}
```

**Decision note:** Some routes (claims, anomalies) always JOIN drug_info anyway for drug names. The `needsJoin` flag is for routes like overview that only need claims columns unless a drug filter is active.

**Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/build-where.ts
git commit -m "feat(api): add buildWhereClause utility for Drizzle query composition"
```

---

## Task 4: Entities Route (`src/app/api/entities/route.ts`)

**Files:**
- Create: `src/app/api/entities/route.ts`

**Step 1: Write the simplest route first**

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { entities } from '@/db/schema';
import type { EntitiesResponse } from '@/lib/api-types';

export async function GET() {
  try {
    const rows = await db.select().from(entities);
    const response: EntitiesResponse = {
      entities: rows.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
      })),
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/entities error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 2: Manual smoke test**

Run: `npm run dev` → `curl http://localhost:3000/api/entities`
Expected: `{"entities":[{"id":1,"name":"Pharmacy A","description":...}]}`

This verifies: Drizzle + Neon connection works, route structure works, JSON response works.

**Step 3: Commit**

```bash
git add src/app/api/entities/route.ts
git commit -m "feat(api): add /api/entities route"
```

---

## Task 5: Filters Route (`src/app/api/filters/route.ts`)

**Files:**
- Create: `src/app/api/filters/route.ts`

**Step 1: Write the filters route**

Three distinct-value queries. Uses `parseFilters` only for `entityId` and `includeFlaggedNdcs` — dimension filters don't apply here (we want ALL available filter options for this entity).

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims, drugInfo } from '@/db/schema';
import { eq, notInArray, sql, inArray } from 'drizzle-orm';
import { parseFilters } from '@/lib/parse-filters';
import { FLAGGED_NDCS } from '@/lib/api-types';
import type { FiltersResponse } from '@/lib/api-types';

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request.nextUrl.searchParams);
    const flaggedNdcs = FLAGGED_NDCS.map(f => f.ndc);

    // Subquery: NDCs that exist in claims for this entity
    const ndcExclusion = !filters.includeFlaggedNdcs && flaggedNdcs.length > 0;

    // Drugs: distinct drug_name from drug_info where ndc is in claims
    const drugsQuery = await db
      .selectDistinct({ drugName: drugInfo.drugName })
      .from(drugInfo)
      .where(
        inArray(
          drugInfo.ndc,
          db.selectDistinct({ ndc: claims.ndc })
            .from(claims)
            .where(
              ndcExclusion
                ? sql`${claims.entityId} = ${filters.entityId} AND ${claims.ndc} NOT IN (${sql.join(flaggedNdcs.map(n => sql`${n}`), sql`, `)})`
                : eq(claims.entityId, filters.entityId)
            )
        )
      )
      .orderBy(drugInfo.drugName);

    // Manufacturers: distinct manufacturer_name from drug_info where ndc is in claims
    const manufacturersQuery = await db
      .selectDistinct({ manufacturer: drugInfo.manufacturerName })
      .from(drugInfo)
      .where(
        inArray(
          drugInfo.ndc,
          db.selectDistinct({ ndc: claims.ndc })
            .from(claims)
            .where(
              ndcExclusion
                ? sql`${claims.entityId} = ${filters.entityId} AND ${claims.ndc} NOT IN (${sql.join(flaggedNdcs.map(n => sql`${n}`), sql`, `)})`
                : eq(claims.entityId, filters.entityId)
            )
        )
      )
      .orderBy(drugInfo.manufacturerName);

    // Groups: distinct group_id from claims
    const groupsQuery = await db
      .selectDistinct({ groupId: claims.groupId })
      .from(claims)
      .where(
        ndcExclusion
          ? sql`${claims.entityId} = ${filters.entityId} AND ${claims.ndc} NOT IN (${sql.join(flaggedNdcs.map(n => sql`${n}`), sql`, `)})`
          : eq(claims.entityId, filters.entityId)
      )
      .orderBy(claims.groupId);

    const response: FiltersResponse = {
      drugs: drugsQuery.map(r => r.drugName).filter((d): d is string => d !== null),
      manufacturers: manufacturersQuery.map(r => r.manufacturer).filter((m): m is string => m !== null),
      groups: groupsQuery.map(r => r.groupId).filter((g): g is string => g !== null),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/filters error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**AC check:** When flagged=false (default), KRYPTONITE XR and LEX LUTHER INC. should NOT appear in the drug/manufacturer lists. When flagged=true, they should appear.

**Step 2: Smoke test**

Run: `curl http://localhost:3000/api/filters | jq '.drugs | length'` → should be ~2400+
Run: `curl http://localhost:3000/api/filters | jq '.drugs[] | select(test("KRYP"))'` → should be empty
Run: `curl 'http://localhost:3000/api/filters?flagged=true' | jq '.drugs[] | select(test("KRYP"))'` → should show KRYPTONITE XR

**Step 3: Commit**

```bash
git add src/app/api/filters/route.ts
git commit -m "feat(api): add /api/filters route with flagged NDC exclusion"
```

---

## Task 6: Overview Route (`src/app/api/overview/route.ts`)

**Files:**
- Create: `src/app/api/overview/route.ts`

**Step 1: Write the overview route**

This is the first complex route. Needs: KPIs, unfilteredKpis, monthly, formulary, states, adjudication.

Key details:
- `unfilteredKpis` ignores dimension filters but respects `entityId` and `includeFlaggedNdcs`
- `reversalRate` = count of net_claim_count=-1 / total * 100
- `monthly` uses `date_trunc('month', date_filled)` for grouping
- When drug_info filters are active (`needsJoin=true`), routes must LEFT JOIN drug_info

The route should use `buildWhereClause` for filtered queries. For `unfilteredKpis`, build a separate where clause with only `entityId` and flagged NDC exclusion (no dimension filters).

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims, drugInfo } from '@/db/schema';
import { eq, sql, and, notInArray } from 'drizzle-orm';
import { parseFilters } from '@/lib/parse-filters';
import { buildWhereClause } from '@/lib/build-where';
import { FLAGGED_NDCS } from '@/lib/api-types';
import type { OverviewResponse, KpiSummary } from '@/lib/api-types';

export async function GET(request: NextRequest) {
  try {
    const filters = parseFilters(request.nextUrl.searchParams);
    const { where, needsJoin } = buildWhereClause(filters);

    // Build base query source (with or without JOIN)
    // For KPIs and aggregations, use raw SQL with the where clause

    // --- Filtered KPIs ---
    const kpiResult = needsJoin
      ? await db.execute(sql`
          SELECT
            COUNT(*)::int AS total_claims,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
            COUNT(DISTINCT c.ndc)::int AS unique_drugs
          FROM claims c
          LEFT JOIN drug_info d ON c.ndc = d.ndc
          WHERE ${where}
        `)
      : await db.execute(sql`
          SELECT
            COUNT(*)::int AS total_claims,
            COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
            ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
            COUNT(DISTINCT c.ndc)::int AS unique_drugs
          FROM claims c
          WHERE ${where}
        `);

    // --- Unfiltered KPIs (entity + flagged only) ---
    const unfilteredConditions = [eq(claims.entityId, filters.entityId)];
    if (!filters.includeFlaggedNdcs && FLAGGED_NDCS.length > 0) {
      unfilteredConditions.push(notInArray(claims.ndc, FLAGGED_NDCS.map(f => f.ndc)));
    }
    const unfilteredWhere = and(...unfilteredConditions);

    const unfilteredKpiResult = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total_claims,
        COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
        ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
        COUNT(DISTINCT c.ndc)::int AS unique_drugs
      FROM claims c
      WHERE ${unfilteredWhere}
    `);

    // --- Monthly ---
    const monthlyBase = needsJoin
      ? sql`FROM claims c LEFT JOIN drug_info d ON c.ndc = d.ndc WHERE ${where}`
      : sql`FROM claims c WHERE ${where}`;

    const monthlyResult = await db.execute(sql`
      SELECT
        to_char(date_trunc('month', c.date_filled), 'YYYY-MM') AS month,
        COALESCE(SUM(CASE WHEN c.net_claim_count = 1 THEN 1 ELSE 0 END), 0)::int AS incurred,
        COALESCE(SUM(CASE WHEN c.net_claim_count = -1 THEN 1 ELSE 0 END), 0)::int AS reversed
      ${monthlyBase}
      GROUP BY date_trunc('month', c.date_filled)
      ORDER BY date_trunc('month', c.date_filled)
    `);

    // --- Formulary breakdown ---
    const formularyResult = await db.execute(sql`
      SELECT
        c.formulary AS type,
        COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
        ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
      ${monthlyBase}
      GROUP BY c.formulary
      ORDER BY net_claims DESC
    `);

    // --- States breakdown ---
    const statesResult = await db.execute(sql`
      SELECT
        c.pharmacy_state AS state,
        COALESCE(SUM(c.net_claim_count), 0)::int AS net_claims,
        COUNT(*)::int AS total_claims,
        ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate
      ${monthlyBase}
      GROUP BY c.pharmacy_state
      ORDER BY net_claims DESC
    `);

    // --- Adjudication ---
    const adjResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE c.adjudicated = true)::int AS adjudicated,
        COUNT(*) FILTER (WHERE c.adjudicated = false)::int AS not_adjudicated,
        ROUND(COUNT(*) FILTER (WHERE c.adjudicated = true)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS rate
      ${monthlyBase}
    `);

    const kpiRow = kpiResult.rows[0] as Record<string, number>;
    const unfilteredKpiRow = unfilteredKpiResult.rows[0] as Record<string, number>;

    const toKpi = (row: Record<string, number>): KpiSummary => ({
      totalClaims: Number(row.total_claims),
      netClaims: Number(row.net_claims),
      reversalRate: Number(row.reversal_rate),
      uniqueDrugs: Number(row.unique_drugs),
    });

    const adjRow = adjResult.rows[0] as Record<string, number>;

    const response: OverviewResponse = {
      kpis: toKpi(kpiRow),
      unfilteredKpis: toKpi(unfilteredKpiRow),
      monthly: monthlyResult.rows.map((r: Record<string, unknown>) => ({
        month: r.month as string,
        incurred: Number(r.incurred),
        reversed: Number(r.reversed),
      })),
      formulary: formularyResult.rows.map((r: Record<string, unknown>) => ({
        type: r.type as string,
        netClaims: Number(r.net_claims),
        reversalRate: Number(r.reversal_rate),
      })),
      states: statesResult.rows.map((r: Record<string, unknown>) => ({
        state: r.state as string,
        netClaims: Number(r.net_claims),
        totalClaims: Number(r.total_claims),
        reversalRate: Number(r.reversal_rate),
      })),
      adjudication: {
        adjudicated: Number(adjRow.adjudicated),
        notAdjudicated: Number(adjRow.not_adjudicated),
        rate: Number(adjRow.rate),
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/overview error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Important implementation note:** The approach above embeds the Drizzle `where` SQL fragment directly into `sql` tagged template literals. This works because Drizzle's `sql` template can accept SQL fragments. If there are issues with this pattern, an alternative is to use raw SQL strings or build the full query with Drizzle's query builder. Test carefully.

**Step 2: Smoke test against known EDA values**

Run: `curl http://localhost:3000/api/overview | jq '.kpis'`
Expected (flagged excluded by default):
- `totalClaims` ≈ 546,523 (596,090 - 49,567 Kryptonite)
- `reversalRate` ≈ 10.81%
- `uniqueDrugs` ≈ 5,639

Run: `curl 'http://localhost:3000/api/overview?flagged=true' | jq '.kpis.totalClaims'`
Expected: 596,090

Run: `curl 'http://localhost:3000/api/overview?state=CA' | jq`
Expected: `kpis` filtered to CA only, `unfilteredKpis` still shows ~546K total

**Step 3: Commit**

```bash
git add src/app/api/overview/route.ts
git commit -m "feat(api): add /api/overview route with KPIs, monthly, formulary, states, adjudication"
```

---

## Task 7: Claims Route (`src/app/api/claims/route.ts`)

**Files:**
- Create: `src/app/api/claims/route.ts`

**Step 1: Write the claims route**

Most complex route. Needs: KPIs, unfilteredKpis, monthly, drugs table (with MODE formulary + topState), days supply bins, MONY, top groups, top manufacturers.

Key complexity:
- **drugs query**: GROUP BY drug_name, ndc. Need most-common formulary per drug (use `MODE() WITHIN GROUP` if Postgres supports it, or window function fallback). Need topState per drug (same approach).
- **daysSupply**: CASE bucketing into 7, 14, 30, 60, 90, Other
- Always JOIN drug_info for drugs, mony, manufacturers queries

For the drugs query, Postgres `MODE() WITHIN GROUP (ORDER BY ...)` is available in Postgres 9.4+. Use it:

```sql
SELECT
  d.drug_name,
  c.ndc,
  SUM(c.net_claim_count)::int AS net_claims,
  ROUND(COUNT(*) FILTER (WHERE c.net_claim_count = -1)::numeric / NULLIF(COUNT(*), 0) * 100, 2) AS reversal_rate,
  MODE() WITHIN GROUP (ORDER BY c.formulary) AS formulary,
  MODE() WITHIN GROUP (ORDER BY c.pharmacy_state) AS top_state
FROM claims c
LEFT JOIN drug_info d ON c.ndc = d.ndc
WHERE ...
GROUP BY d.drug_name, c.ndc
ORDER BY net_claims DESC
LIMIT $limit
```

Structure parallel to overview route: reuse `buildWhereClause`, build `monthlyBase` SQL fragment, run all sub-queries.

The `limit` param from query string (default 20).

**Step 2: Smoke test**

Run: `curl http://localhost:3000/api/claims | jq '.drugs[:3]'`
Expected: Top drugs should include Atorvastatin 40mg, Tamsulosin 0.4mg, Pantoprazole 40mg (per EDA findings)

Run: `curl http://localhost:3000/api/claims | jq '.daysSupply'`
Expected: Bins with "14" having ~113K count, "7" having ~80K

Run: `curl 'http://localhost:3000/api/claims?limit=5' | jq '.drugs | length'`
Expected: 5

**Step 3: Commit**

```bash
git add src/app/api/claims/route.ts
git commit -m "feat(api): add /api/claims route with drugs table, days supply, MONY, groups, manufacturers"
```

---

## Task 8: Anomalies Route (`src/app/api/anomalies/route.ts`)

**Files:**
- Create: `src/app/api/anomalies/route.ts`

**Step 1: Write the anomalies route**

Four panels with hardcoded narratives + queried mini chart data.

**Panel 1: Kryptonite XR** (`id: "kryptonite-xr"`)
- Always computed regardless of toggle
- `beforeAfter`: 5 metrics (Total Claims, May Volume, Net Claims, Reversal Rate, Unique Drugs) with/without NDC 65862020190
- `miniCharts`: Monthly volume of Kryptonite-only claims (12 months, showing May spike)
- Narratives hardcoded

**Panel 2: September Spike** (`id: "sept-spike"`)
- Monthly totals (excl Kryptonite) for comparison
- September claims by state (grouped bar)
- September claims by formulary (stacked bar)
- `keyStat`: compute as % above average of "normal months" (exclude May and Nov)

**Panel 3: November Dip** (`id: "nov-dip"`)
- Monthly totals for comparison
- November claims by state
- November top 10 groups vs their average
- `keyStat`: compute as % below average

**Panel 4: KS August Batch Reversal** (`id: "ks-aug-batch-reversal"`)
- KS monthly reversal rates (12 bars, August is the outlier)
- Top 5 batch-reversal groups with Jul/Aug/Sep volume
- `keyStat: "81.6%"`

This is the most query-heavy route. Use multiple parallel `db.execute()` calls where possible.

Narrative strings (hardcoded examples):
```typescript
// Kryptonite
whatWeSee: 'NDC 65862020190 ("KRYPTONITE XR" by LEX LUTHER INC.) accounts for 49,567 claims (8.3% of the dataset). 99.5% of these claims are concentrated in May, making May effectively a synthetic month.',
whyItMatters: 'This is almost certainly a test/dummy drug injected into the dataset. If not identified, it inflates May volume by ~20x and skews monthly trends, reversal rates, and drug mix analysis.',
toConfirm: 'Is this a known test record? Should it be permanently excluded from production reporting?',
rfpImpact: 'Demonstrates data quality detection capability. Any analytics vendor that reports May as a real peak month has failed a basic data integrity check.'
```

**Step 2: Smoke test**

Run: `curl http://localhost:3000/api/anomalies | jq '.panels | length'`
Expected: 4

Run: `curl http://localhost:3000/api/anomalies | jq '.panels[0].id'`
Expected: "kryptonite-xr"

Run: `curl http://localhost:3000/api/anomalies | jq '.panels[0].beforeAfter | length'`
Expected: 5

**Step 3: Commit**

```bash
git add src/app/api/anomalies/route.ts
git commit -m "feat(api): add /api/anomalies route with 4 investigation panels"
```

---

## Task 9: Integration Smoke Test + Batch Commit

**Step 1: Run all routes and verify against EDA oracle values**

```bash
# Overview — total claims should be ~546K (flagged excluded)
curl -s http://localhost:3000/api/overview | jq '.kpis.totalClaims'

# Overview — with flagged should be ~596K
curl -s 'http://localhost:3000/api/overview?flagged=true' | jq '.kpis.totalClaims'

# Overview — state filter should narrow kpis but not unfilteredKpis
curl -s 'http://localhost:3000/api/overview?state=CA' | jq '{filtered: .kpis.totalClaims, unfiltered: .unfilteredKpis.totalClaims}'

# Claims — top drug should be Atorvastatin-adjacent
curl -s http://localhost:3000/api/claims | jq '.drugs[0].drugName'

# Claims — 12 months in monthly
curl -s http://localhost:3000/api/claims | jq '.monthly | length'

# Anomalies — 4 panels
curl -s http://localhost:3000/api/anomalies | jq '[.panels[].id]'

# Filters — no Kryptonite when flagged off
curl -s http://localhost:3000/api/filters | jq '[.drugs[] | select(test("KRYP"))]'

# Filters — Kryptonite present when flagged on
curl -s 'http://localhost:3000/api/filters?flagged=true' | jq '[.drugs[] | select(test("KRYP"))]'

# Entities
curl -s http://localhost:3000/api/entities | jq '.entities[0].name'
```

**Step 2: Fix any issues found**

Iterate until all smoke tests pass.

**Step 3: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix(api): integration test fixes for SPEC-001 routes"
```

---

## Implementation Order Summary

| Task | File | Complexity | Depends On |
|------|------|-----------|------------|
| 1 | `src/lib/api-types.ts` | Low | None |
| 2 | `src/lib/parse-filters.ts` | Low | Task 1 |
| 3 | `src/lib/build-where.ts` | Medium | Task 1 |
| 4 | `src/app/api/entities/route.ts` | Low | None (smoke-tests DB connection) |
| 5 | `src/app/api/filters/route.ts` | Medium | Tasks 1-2 |
| 6 | `src/app/api/overview/route.ts` | High | Tasks 1-3 |
| 7 | `src/app/api/claims/route.ts` | High | Tasks 1-3 |
| 8 | `src/app/api/anomalies/route.ts` | High | Tasks 1-3 |
| 9 | Integration smoke test | Medium | Tasks 4-8 |

Tasks 1-3 are sequential (each depends on prior). Task 4 can run in parallel with 2-3. Tasks 5-8 can run in parallel after 1-3 are done. Task 9 is last.

## Key Oracle Values (from EDA — use as test assertions)

- Total claims (flagged excluded): ~546,523
- Total claims (flagged included): 596,090
- Kryptonite claims: 49,567
- Reversal rate (overall, excl flagged): ~10.81%
- Adjudication rate: ~25.1%
- States: CA, IN, PA, KS, MN (5 states)
- Formularies: OPEN, MANAGED, HMF (3 types)
- 12 months of data (every day of 2021)
- Top drug: Atorvastatin 40mg (~10,154 claims)
- Days supply mode: 14 days (~113K)
- Unique drugs (excl flagged): ~5,639
- KS August reversal rate: 81.6%
- September spike: ~+57% above average (excl Kryptonite)
- November dip: ~-49% below average
