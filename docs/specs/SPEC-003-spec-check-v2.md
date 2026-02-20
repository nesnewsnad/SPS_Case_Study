# Spec Check: SPEC-003 — Executive Overview (v2)

**Checked by:** Mac (re-check with updated skills + verified SPEC-001)
**Date:** 2026-02-20

---

## AC Quality

| AC                                                                     | Testable | Scoped | Measurable | Issues                               |
| ---------------------------------------------------------------------- | -------- | ------ | ---------- | ------------------------------------ |
| 1. Page fetches /api/overview with filter params, renders all sections | YES      | YES    | YES        | —                                    |
| 2. Re-fetches when filters change                                      | YES      | YES    | YES        | Depends on SPEC-002 useFilters()     |
| 3. Four KPI cards with correct formatting                              | YES      | YES    | YES        | —                                    |
| 4. Delta indicators when filters active, none when unfiltered          | YES      | YES    | YES        | Complex formula — see note 1         |
| 5. Hero stacked area chart, 12 months                                  | YES      | YES    | YES        | —                                    |
| 6. Reference lines for Sept spike + Nov dip                            | YES      | YES    | YES        | Hardcoded labels — see note 2        |
| 7. Click month → toggles date filter                                   | YES      | YES    | YES        | **Needs TWO keys** — see note 3      |
| 8. Formulary donut, click → toggleFilter                               | YES      | YES    | YES        | —                                    |
| 9. State bars sorted desc, all teal                                    | YES      | YES    | YES        | —                                    |
| 10. Click state bar → toggleFilter                                     | YES      | YES    | YES        | —                                    |
| 11. Adjudication gauge semicircle + context note                       | YES      | YES    | YES        | —                                    |
| 12. 1-3 insight cards, >= 15 templates                                 | YES      | YES    | YES        | Template count breakdown is concrete |
| 13. Skeleton loading states, no blank screens                          | YES      | YES    | YES        | —                                    |
| 14. Empty state with clear-filters nudge                               | YES      | YES    | YES        | —                                    |
| 15. Geist Mono for numbers, Geist Sans for labels                      | YES      | YES    | YES        | `font-mono` class in Tailwind        |
| 16. Tooltip formats per Behavior section                               | YES      | YES    | YES        | Specific per chart type              |

**All 16 ACs pass quality check.** One action item (note 3).

---

## Notes

### Note 1: Delta indicator formula

The formula uses hardcoded dimension counts: state=5, formulary=3, mony=4, month=12. These are correct for Pharmacy A 2021 data but would break for a different entity. Acceptable for the case study — flag if extending to multi-entity.

The "vs avg" vs "vs total" switch (single-dimension vs multi-dimension/groupId) is well-specified but complex. Implementor should extract this to a pure function for testability.

### Note 2: Reference line labels are hardcoded

The spec says "+41%" and "-54%" as reference line labels, always visible regardless of filter state. These are annotations about the overall dataset, not the filtered view. With filters active, the chart data changes but the annotations stay fixed. This is intentional ("they're annotations, not data") and correct.

Hardcoding is fine for Pharmacy A. If multi-entity, these would need to be dynamic.

### Note 3: Month click requires setting TWO filter keys (ACTION ITEM)

AC 7 says "toggles a date filter via `toggleFilter`" but the behavior section says:

> Click a month → sets `dateStart` to `'YYYY-MM-01'` and `dateEnd` to `'YYYY-MM-DD'` (last day of that month)

This requires setting TWO keys (`dateStart` + `dateEnd`), not one. `toggleFilter(key, value)` from SPEC-002 only operates on a single key. The implementor must:

1. Call `setFilter('dateStart', ...)` + `setFilter('dateEnd', ...)` in the same handler (both coalesce within 200ms debounce — produces one history entry)
2. To "un-toggle": check if `filters.dateStart` matches the clicked month, then `removeFilter('dateStart')` + `removeFilter('dateEnd')`

This works correctly with SPEC-002's debounce. The AC wording ("toggleFilter") is slightly misleading but the behavior section is clear. **No spec revision needed** — implementor should follow the behavior section, not the AC shorthand.

---

## Dependencies

| Dependency                           | Status                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| SPEC-001 (API routes + types)        | **DONE** — verified PASS, `/api/overview` complete                              |
| SPEC-002 (FilterContext + FilterBar) | **IN PROGRESS** — Framework implementing now                                    |
| Recharts                             | **INSTALLED** — v3.7.0, zero usage yet. SPEC-003 writes first chart components. |
| shadcn Skeleton                      | **INSTALLED** — available at `src/components/ui/skeleton.tsx`                   |
| Geist fonts                          | **INSTALLED** — `font-mono` and `font-sans` via Tailwind config                 |

---

## Reuse Opportunities

| What                    | Where                            | How to Reuse                                                                   |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| KPI card HTML structure | `src/app/page.tsx` (placeholder) | Expand in-place: add `'use client'`, wire data, add delta indicator            |
| Chart grid layout       | `src/app/page.tsx`               | `lg:grid-cols-7` (hero row) + `lg:grid-cols-2` (bottom row) already match spec |
| Card components         | `src/components/ui/card.tsx`     | Drop-in: `Card`, `CardHeader`, `CardTitle`, `CardContent`                      |
| Skeleton component      | `src/components/ui/skeleton.tsx` | Drop-in: `<Skeleton className="h-8 w-24" />`                                   |
| Badge component         | `src/components/ui/badge.tsx`    | Available for insight card severity indicators                                 |
| All API types           | `src/lib/api-types.ts`           | Import `OverviewResponse`, `KpiSummary`, `MonthlyDataPoint`, etc.              |
| Lucide icons            | package.json                     | Installed — available for KPI card icons                                       |
| `cn()` utility          | `src/lib/utils.ts`               | Standard className merging                                                     |

### New files SPEC-003 creates (owned by this spec):

- `src/lib/format.ts` — number formatting (commas, %, abbreviations)
- `src/lib/generate-insights.ts` — template engine for insight cards
- `src/components/overview/*.tsx` — chart wrapper components (directory doesn't exist yet)

---

## Non-Goals

**Verdict: Specific enough.** 8 non-goals with clear boundaries:

- Claims Explorer (SPEC-004)
- Anomalies page
- API routes (SPEC-001)
- FilterBar (SPEC-002)
- Mobile responsive
- Animation beyond skeletons
- Export/download
- Dark mode

---

## Implicit Decisions

1. **Recharts v3 API**: Installed v3.7.0 which is relatively new. Most Recharts examples online show v2 syntax. Key v3 changes: `ResponsiveContainer` may have different defaults, some prop types changed. Implementor should reference v3 docs, not v2 tutorials.

2. **`format.ts` ownership**: SPEC-003 creates this shared utility. SPEC-004 will import from it. If both specs are implemented in parallel, coordinate to avoid conflicts.

3. **`generate-insights.ts` extensibility**: SPEC-003 writes the core function + overview templates. SPEC-004 extends with explorer templates. The function signature should accept a `view` param or similar to select template sets.

4. **Page-level data fetching pattern**: Spec says "use `useEffect` + `fetch` or a lightweight wrapper." No SWR, no React Query. The implementor should build a simple `useFetch` or inline `useEffect` + `useState` pattern. Consider extracting a `useOverviewData(filters)` hook for cleanliness.

---

## Verdict: READY

All 16 ACs pass quality check. Note 3 (month click = two keys) is an implementor clarification, not a spec defect — the behavior section is unambiguous. Dependencies are on track (SPEC-002 in progress).

**Implementor notes:**

1. Month chart click → use `setFilter` twice (dateStart + dateEnd), not `toggleFilter` — both coalesce within debounce
2. Delta indicators: extract to pure function, use hardcoded dimension counts (5/3/4/12)
3. Reference lines: hardcode "+41%" and "-54%" labels
4. This is the first Recharts usage in the codebase — Recharts v3.7.0 installed, use v3 API docs
5. Create `src/lib/format.ts` with commas, percentage, and abbreviation helpers — SPEC-004 will reuse
6. `font-mono` class = Geist Mono in this project's Tailwind config
