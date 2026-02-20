# Verification: SPEC-001 — API Routes & Shared Types

**Verified by:** Mac (reviewer — did not write the implementation)
**Date:** 2026-02-20
**Files reviewed:** 8 (api-types.ts, parse-filters.ts, build-where.ts, 5 route files)

---

## Goal Statement

What must be TRUE: Six server-side API routes exist under `src/app/api/`, all return aggregated JSON, accept unified filter parameters, scope by entity, exclude flagged NDCs by default, and share TypeScript types. No raw claim rows are ever sent to the browser.

---

## AC Verification

| AC                                                                    | Exists | Substantive                                                                                                                                   | Wired                                                | Verdict    | Evidence                                                                                          |
| --------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| 1. api-types.ts exports all interfaces                                | YES    | 21 interfaces + FLAGGED_NDCS const, every field matches spec                                                                                  | Imported by all 5 routes + parse-filters             | **PASS**   | All types present: FilterParams, KpiSummary, MonthlyDataPoint, \*Response types, etc.             |
| 2. parseFilters() extracts params, defaults entityId=1, flagged=false | YES    | 11 params extracted, `\|\| 1` default, `=== 'true'` default                                                                                   | Imported by overview, claims, anomalies, filters     | **PASS**   | Line 5: `Number(...) \|\| 1`; Line 15: `=== 'true'`                                               |
| 3. buildWhereClause returns Drizzle where + needsJoin boolean         | YES    | Correct WhereResult shape, and()/notInArray/eq composition, needsJoin on mony/manufacturer/drug                                               | **NOT IMPORTED BY ANY ROUTE**                        | **PASS\*** | File exists, exports correct interface. See [Dead Code Finding](#dead-code-finding)               |
| 4. /api/overview returns valid OverviewResponse                       | YES    | 6 parallel queries: KPIs, unfilteredKpis, monthly, formulary, states, adjudication. All aggregated.                                           | Route at correct path, exports GET                   | **PASS**   | Correct SQL: COUNT, SUM, FILTER, GROUP BY, DISTINCT                                               |
| 5. /api/overview?state=CA filters KPIs; unfilteredKpis stays baseline | YES    | buildRawWhere applies state filter; buildBaselineWhere only applies entityId + flagged                                                        | parseFilters extracts state param                    | **PASS**   | Line 30: `c.pharmacy_state = ${filters.state}`; baseline (line 52-65) omits all dimension filters |
| 6. /api/claims returns ClaimsResponse with all sections               | YES    | 8 parallel queries: KPIs, unfiltered, monthly, drugs, daysSupply, MONY, groups, manufacturers                                                 | Route at correct path, exports GET                   | **PASS**   | Drugs: MODE() WITHIN GROUP for formulary/topState. Top 10 groups/manufacturers.                   |
| 7. /api/claims?limit=50 returns up to 50 drugs                        | YES    | `Number(searchParams.get('limit')) \|\| 20`                                                                                                   | Used in drugs query LIMIT clause                     | **PASS**   | Line 68: default 20; Line 129: `LIMIT ${limit}`                                                   |
| 8. /api/anomalies returns 4 panels with narratives + miniCharts       | YES    | 4 panels with correct IDs, hardcoded narrative strings, DB-queried miniChart data                                                             | Route at correct path, exports GET                   | **PASS**   | IDs: kryptonite-xr, sept-spike, nov-dip, ks-aug-batch-reversal                                    |
| 8a. Kryptonite beforeAfter[] with 5 metrics, toggle-independent       | YES    | 5 metrics (Total Claims, May Volume, Net Claims, Reversal Rate, Unique Drugs). Both with/without computed independently of includeFlaggedNdcs | beforeAfter on kryptonitePanel object                | **PASS**   | Lines 26-77: 5 parallel queries, none reference filters.includeFlaggedNdcs                        |
| 9. /api/filters returns sorted distinct drugs, manufacturers, groups  | YES    | 3 queries: DISTINCT drug_name, manufacturer_name, group_id. All sorted. Only values in claims.                                                | Route at correct path, exports GET                   | **PASS**   | ORDER BY on all three queries                                                                     |
| 10. /api/entities returns entities list                               | YES    | Simple SELECT from entities table, maps to Entity interface                                                                                   | Route at correct path, exports GET                   | **PASS**   | Drizzle `db.select().from(entities)`                                                              |
| 11. All routes try/catch → { error } 500                              | YES    | All 5 routes wrap in try/catch, return `{ error: 'Internal server error' }` with status 500                                                   | console.error logs before returning                  | **PASS**   | Verified in all 5 route files                                                                     |
| 12. All routes Content-Type: application/json                         | YES    | All use NextResponse.json() which sets header automatically                                                                                   | N/A (framework behavior)                             | **PASS**   | NextResponse.json() in all routes                                                                 |
| 13. No route returns raw claim rows                                   | YES    | All queries use GROUP BY, COUNT, SUM, DISTINCT, or entity metadata                                                                            | N/A                                                  | **PASS**   | Zero SELECT \* FROM claims without aggregation                                                    |
| 14. Default excludes FLAGGED_NDCS; overview ~546K not ~596K           | YES    | overview, claims, filters all apply `NOT IN` exclusion. anomalies excludes via `!= flaggedNdc`                                                | parseFilters defaults flagged=false                  | **PASS**   | 596,090 - 49,567 = 546,523 ≈ 546K                                                                 |
| 15. unfilteredKpis ignores dimension filters, respects flagged toggle | YES    | overview: buildBaselineWhere (entityId + flagged only). claims: buildUnfilteredWhere (same).                                                  | Included in both OverviewResponse and ClaimsResponse | **PASS**   | Both baseline builders check `includeFlaggedNdcs` but skip state/formulary/mony/etc.              |
| 16. /api/filters excludes flagged-only drugs/manufacturers            | YES    | Subquery scopes to non-flagged claim NDCs → KRYPTONITE XR and LEX LUTHER INC. excluded                                                        | claimsFilter applies NDC exclusion                   | **PASS**   | Lines 14-19: ndc NOT IN when flagged excluded                                                     |

**\*AC 3 passes the AC letter** (file exists, exports correct interface) but the utility is dead code — see finding below.

---

## Dead Code Finding

**`src/lib/build-where.ts` is not imported by any file.** Confirmed via grep: zero imports of `build-where` anywhere in `src/`.

All 5 routes implement their own local filter-building logic using raw SQL template literals instead of using the shared Drizzle-based helper:

| Route     | Local function                             | Lines      |
| --------- | ------------------------------------------ | ---------- |
| overview  | `buildRawWhere()` + `buildBaselineWhere()` | 16-65      |
| claims    | `buildWhere()` + `buildUnfilteredWhere()`  | 22-59      |
| anomalies | Inline SQL per panel                       | throughout |
| filters   | Inline SQL via `claimsFilter`              | 14-19      |
| entities  | No claim filters needed                    | N/A        |

**Risk**: If a new filter param is added (e.g., `daysSupplyMin`), it must be updated in 4 separate files. The "shared utility" pattern the spec envisioned is not realized.

**Recommendation**: Either (a) refactor routes to import from `build-where.ts`, or (b) delete `build-where.ts` to avoid confusion. Given the tight timeline, option (b) is acceptable — the duplicated logic is correct and consistent across all routes. The raw SQL approach may have been chosen for flexibility (each route's queries are complex enough to need custom SQL anyway).

---

## Stub Detection

- No `TODO`, `FIXME`, `PLACEHOLDER`, `HACK`, `XXX`, or `console.log` (debugging) found in any implementation file.
- No empty function bodies.
- No hardcoded sample data where DB data should be.
- No commented-out code blocks.
- `console.error` in catch blocks is intentional (error logging), not debugging.

**Result: CLEAN**

---

## Minor Notes (non-blocking)

1. **daysSupply uses SUM(net_claim_count) instead of COUNT(\*)**: Spec says "COUNT per bin" but implementation uses `SUM(c.net_claim_count)::int`. This gives _net_ claims per bin rather than raw row count. Consistent with how all other metrics in ClaimsResponse use net semantics. Acceptable but technically differs from spec text.

2. **Anomalies route hardcodes `FLAGGED_NDCS[0].ndc`**: Instead of iterating the full array, uses `const flaggedNdc = FLAGGED_NDCS[0].ndc`. Works with one flagged NDC but won't scale if more are added. Low risk — adding flagged NDCs is a manual process anyway.

3. **keyStat percentages are dynamic**: Sept spike and Nov dip keyStats are computed at query time (e.g., `` `+${septPct}%` ``). The "normal-month average" excludes May and Nov (10 months, including Sep itself), which dilutes the Sept spike slightly vs. the CLAUDE.md finding of "+41%" (which excludes May, Sep, Nov = 9 months). The dynamic value may show ~+36% instead of +41%. This is defensible either way — dynamic is more accurate to the chosen methodology.

---

## Scope Creep

No scope creep detected. Implementation stays within SPEC-001 boundaries:

- No client components
- No UI rendering
- No authentication
- No caching headers
- No pagination beyond `limit` on claims drugs

---

## Browser Test

N/A for API routes (no UI). Routes were smoke-tested against live DB by Framework; Mac verified code logic only.

---

## Overall: PASS

All 16 acceptance criteria are satisfied. The implementation is substantive, correctly wired, and free of stubs. The one significant finding — `build-where.ts` as dead code — is a code quality concern, not a correctness issue. All routes independently implement correct, consistent filter logic. No blocking issues.

### Action Items for Framework (non-blocking, do alongside SPEC-002)

1. **Delete `build-where.ts`** or refactor routes to use it (recommend delete given timeline)
2. **Consider**: add `labelName` to drugs API response (TODO item from checkpoint)
