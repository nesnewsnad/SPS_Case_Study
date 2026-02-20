# DISCUSS-001 — Executive Overview + Claims Explorer Implementation Scope

**Date:** 2026-02-19
**Scope:** FilterContext, all API routes, Executive Overview page, Claims Explorer page
**Status:** LOCKED

---

## Spec Structure (Locked)

Horizontal slices — 4 specs, clean dependency graph:

| Spec | Scope | Depends On |
|------|-------|------------|
| SPEC-001 | All API routes + shared TypeScript types | — |
| SPEC-002 | FilterContext + FilterBar component + URL sync | — |
| SPEC-003 | Executive Overview page | SPEC-001, SPEC-002 |
| SPEC-004 | Claims Explorer page | SPEC-001, SPEC-002 |

SPEC-001 and SPEC-002 are independent — can be implemented in parallel.
SPEC-003 and SPEC-004 are independent of each other — both depend on 001 + 002.

---

## Locked Decisions

### 1. API Architecture — Single Endpoint Per View
- `/api/overview` — one response object with all Overview data (KPIs, monthly, formulary, states, adjudication)
- `/api/claims` — one response object with all Explorer data (monthly trend, top drugs, days supply, MONY, top groups, top manufacturers)
- `/api/anomalies` — pre-computed anomaly breakdowns (implemented later, contract defined in SPEC-001)
- `/api/drugs` — top drugs with counts and rates (implemented later, contract defined in SPEC-001)
- `/api/entities` — list of onboarded entities (implemented later, contract defined in SPEC-001)
- `/api/filters` — all distinct values for searchable filter dimensions (Drug Name, Manufacturer, Group ID)
- All endpoints accept unified filter params: `entityId`, `formulary`, `state`, `mony`, `manufacturer`, `drug`, `ndc`, `dateStart`, `dateEnd`, `groupId`
- One fetch per page load, one loading state per view

### 2. API Response Shapes

**`/api/overview`:**
```typescript
{
  kpis: { totalClaims: number, netClaims: number, reversalRate: number, uniqueDrugs: number },
  unfilteredKpis: { totalClaims: number, netClaims: number, reversalRate: number, uniqueDrugs: number },
  monthly: [{ month: string, incurred: number, reversed: number }],
  formulary: [{ type: string, netClaims: number, reversalRate: number }],
  states: [{ state: string, netClaims: number, totalClaims: number, reversalRate: number }],
  adjudication: { adjudicated: number, notAdjudicated: number, rate: number }
}
```

**`/api/claims`:**
```typescript
{
  kpis: { totalClaims: number, netClaims: number, reversalRate: number, uniqueDrugs: number },
  unfilteredKpis: { totalClaims: number, netClaims: number, reversalRate: number, uniqueDrugs: number },
  monthly: [{ month: string, incurred: number, reversed: number }],
  drugs: [{ drugName: string, ndc: string, netClaims: number, reversalRate: number, formulary: string, topState: string }],
  daysSupply: [{ bin: string, count: number }],
  mony: [{ type: string, netClaims: number }],
  topGroups: [{ groupId: string, netClaims: number }],
  topManufacturers: [{ manufacturer: string, netClaims: number }]
}
```

**`/api/filters`:**
```typescript
{
  drugs: string[],
  manufacturers: string[],
  groups: string[]
}
```

Note: `unfilteredKpis` is always the full-dataset KPIs regardless of active filters. Client computes delta: `(filtered - avg) / avg * 100`.

### 3. Insight Card Engine — Client-Side Templates
- `generateInsights(filters, data)` utility returns `{ title: string, body: string, severity: 'info' | 'warning' | 'positive' }[]`
- Templates live in a single file, interpolate real values from the API response
- No LLM, no server round-trip for prose
- ~20-25 templates covering: unfiltered, per-state, per-month (Sep/Nov/generic), per-formulary, combinations (most-specific match wins)
- Consultant-analyst tone, hand-tuned

### 4. Gauge Chart — Custom PieChart Hack
- Recharts PieChart with `startAngle={180}` / `endAngle={0}` (semicircle)
- Two segments: adjudicated vs. not adjudicated
- Centered label in Geist Mono showing percentage
- LTC context note rendered beneath the chart
- No new dependencies

### 5. Searchable Filters — Pre-Loaded Client-Side
- `/api/filters` endpoint returns all distinct Drug Names (~5,600), Manufacturers (~2,400), Group IDs (~189) in one call
- Client stores full option sets in memory
- Typeahead filtering is instant (client-side string matching)
- No debounce, no server-side search, no loading spinners in dropdowns
- FilterBar component with `view` prop: `"overview"` renders base filters (Formulary, State, MONY, Date Range), `"explorer"` adds Drug, Manufacturer, Group ID

### 6. KPI Delta Indicators — Delta vs. Per-Dimension Average
- When filters are active: show "+X% vs. avg" or "-X% vs. avg"
- Baseline = average across the filtered dimension (e.g., state avg = unfiltered total / 5 states)
- When no filters active: raw KPI numbers, no delta shown
- Computed client-side using `unfilteredKpis` from the API response
- Positive deltas in emerald, negative in amber, neutral in slate

### 7. Flagged NDC Handling — Global Toggle (Added 2026-02-19 post-EDA)
- Fresh EDA discovered NDC 65862020190 ("KRYPTONITE XR" by "LEX LUTHER INC.") — a synthetic test drug, 49,567 claims (8.3%), 99.5% in May
- **Approach**: `buildWhereClause` excludes flagged NDCs by default via `AND ndc NOT IN (...)`. A global `includeFlaggedNdcs` toggle (default OFF) in FilterBar re-includes them when flipped ON.
- The toggle is a `Switch` on all views, right-aligned in the FilterBar, with amber visual when ON
- Does NOT count toward `activeFilterCount`, does NOT render as a chip pill
- `clearAll()` resets the toggle to OFF
- Anomalies page has a dedicated Kryptonite panel with `beforeAfter[]` comparison — shows impact with/without the flagged NDC regardless of toggle state
- `FLAGGED_NDCS` is an extensible registry (array of `{ ndc, label, reason }`) — currently 1 entry

### 8. Corrected Anomaly Narratives (Added 2026-02-19 post-EDA)
- September spike: **+57%** (was +43% — old number included Kryptonite in baseline)
- November dip: **-49%** (was -54% — old number included Kryptonite)
- Kansas: NOT a general "high reversal" state. It's a **specific August batch reversal event** — 18 KS-only groups with 100% reversal in Aug, then re-incur in Sep. KS reversal rate is ~10% in every other month.
- Anomaly panels now 4 (was 3): `kryptonite-xr`, `sept-spike`, `nov-dip`, `ks-aug-batch-reversal`
- KS bar on Overview no longer gets amber highlighting (rates are normal)
- MONY donut: Y (single-source generic) is 77% of claims, not O — color assignments corrected

---

## Claude's Discretion

These areas don't need user input — any reasonable implementation is fine:

- Exact SQL query structure (CTEs vs. subqueries vs. joins)
- React component file organization within `/src/components/`
- Debounce timing on URL sync (200-300ms is fine)
- Exact skeleton shimmer implementation
- Chart tooltip formatting details
- Pagination component choice for drugs table

---

## Deferred Ideas

- Anomalies & Recommendations page → future SPEC (after SPEC-004)
- AI Process page → future SPEC
- Extension mock-ups → future SPEC
- Mobile/responsive → explicitly out of scope (desktop only, min 1200px)
- Export/download functionality → not in brief, not building

---

## References

- Design doc: `docs/plans/2026-02-19-dashboard-design.md` (source of truth for visual design)
- Schema: `src/db/schema.ts` (claims, drug_info, entities tables)
- Existing scaffold: placeholder pages at `/`, `/explorer`, `/anomalies`, `/process`
