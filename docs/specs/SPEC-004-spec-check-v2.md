# Spec Check: SPEC-004 — Claims Explorer (v2)

**Checked by:** Mac (re-check with updated skills + verified SPEC-001)
**Date:** 2026-02-20

---

## AC Quality

| AC                                                                                     | Testable | Scoped | Measurable | Issues                                  |
| -------------------------------------------------------------------------------------- | -------- | ------ | ---------- | --------------------------------------- |
| 1. Page at /explorer fetches /api/claims, renders all sections                         | YES      | YES    | YES        | —                                       |
| 2. Re-fetches when filters change                                                      | YES      | YES    | YES        | Depends on SPEC-002                     |
| 3. FilterBar view="explorer" with all 7 controls                                       | YES      | YES    | YES        | Integration test of SPEC-002            |
| 4. Mini trend: compact stacked area, ~150px, 12 months                                 | YES      | YES    | YES        | —                                       |
| 4a. Click month → toggle date filter                                                   | YES      | YES    | YES        | Same two-key pattern as SPEC-003 note 3 |
| 5. Drug table: 6 columns (drugName, NDC, netClaims, reversalRate, formulary, topState) | YES      | YES    | YES        | See note 1 re: labelName tooltip        |
| 6. Table sortable, Net Claims desc default                                             | YES      | YES    | YES        | —                                       |
| 7. Pagination toggle: Top 20 / Top 50                                                  | YES      | YES    | YES        | —                                       |
| 8. Click drug row → toggle drug filter                                                 | YES      | YES    | YES        | —                                       |
| 9. Days Supply histogram: 6 bins                                                       | YES      | YES    | YES        | —                                       |
| 10. MONY donut: 4 segments, full labels, clickable                                     | YES      | YES    | YES        | —                                       |
| 11. Top 10 Groups bars, clickable                                                      | YES      | YES    | YES        | —                                       |
| 12. Top 10 Manufacturers bars, clickable                                               | YES      | YES    | YES        | —                                       |
| 13. Reversal rate: amber >15%, red >20%                                                | YES      | YES    | YES        | Clear thresholds                        |
| 14. 1-3 insight cards, >= 10 Explorer templates                                        | YES      | YES    | YES        | Template count breakdown concrete       |
| 15. Skeleton loading states                                                            | YES      | YES    | YES        | —                                       |
| 16. Empty state with clear-filters nudge                                               | YES      | YES    | YES        | —                                       |
| 17. Number formatting: commas, 1-decimal %, Geist Mono                                 | YES      | YES    | YES        | Reuse format.ts from SPEC-003           |

**All 17 ACs pass quality check.** One enhancement note.

---

## Notes

### Note 1: labelName now available for drug table tooltips

We added `labelName: string | null` to `DrugRow` and the `/api/claims` drugs query this session. The spec says drug names should "truncate at ~30 chars with tooltip" — the tooltip should show `labelName` (detailed label with strength/form, e.g., "ATORVASTATIN CALCIUM 40MG TAB") rather than just the truncated `drugName`. This makes the tooltip genuinely useful.

**Not in the spec text, but in the TODO and aligned with the brief's data dictionary.** Implementor should use `labelName` for the tooltip content, falling back to `drugName` if null.

### Note 2: Days Supply click is visual-only

Explicitly stated in the spec and non-goals: "daysSupply is not a filter dimension in SPEC-001 and adding it is out of scope." The click shows a visual highlight only — no `toggleFilter` call, no URL change, no API re-fetch. This is the ONE chart that breaks the cross-filtering pattern. Make sure it's obviously visual-only (maybe a lighter highlight style than the filtered charts).

### Note 3: SPEC-004 must follow SPEC-003

SPEC-004 extends `generateInsights()` in `src/lib/generate-insights.ts` (owned by SPEC-003). The file must exist before SPEC-004 can add Explorer templates. Framework should implement SPEC-003 first, then SPEC-004 — or at minimum, create `generate-insights.ts` + `format.ts` during SPEC-003 before starting SPEC-004.

---

## Dependencies

| Dependency                                     | Status                                                         |
| ---------------------------------------------- | -------------------------------------------------------------- |
| SPEC-001 (API routes + types)                  | **DONE** — `/api/claims` verified, `labelName` added           |
| SPEC-002 (FilterContext + FilterBar)           | **IN PROGRESS** — Framework implementing                       |
| SPEC-003 (`format.ts`, `generate-insights.ts`) | **NOT STARTED** — SPEC-004 extends these, must build 003 first |
| `@tanstack/react-table`                        | **INSTALLED** — v8.21.3 in package.json                        |
| Recharts                                       | **INSTALLED** — v3.7.0                                         |
| shadcn Table                                   | **INSTALLED** — `src/components/ui/table.tsx`                  |

---

## Reuse Opportunities

| What                   | Where                                   | How to Reuse                                                                                     |
| ---------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ClaimsResponse types   | `src/lib/api-types.ts`                  | Import `DrugRow`, `DaysSupplyBin`, `MonyBreakdown`, `GroupVolume`, `ManufacturerVolume`          |
| `format.ts`            | Created by SPEC-003                     | Import commas, percentage, abbreviation helpers                                                  |
| `generateInsights()`   | Created by SPEC-003                     | Add Explorer template set alongside Overview templates                                           |
| Mini trend chart       | Shared pattern with SPEC-003 hero chart | Could extract a shared `<MonthlyAreaChart>` component with a `compact` prop — implementor's call |
| Horizontal bar pattern | SPEC-003 state bars                     | Same Recharts `BarChart layout="vertical"` pattern — extract or duplicate                        |
| Donut pattern          | SPEC-003 formulary donut                | Same Recharts `PieChart` pattern with different data/colors                                      |
| shadcn Table           | `src/components/ui/table.tsx`           | Drop-in for drug table DOM, wire with `@tanstack/react-table`                                    |
| Card, Skeleton, Badge  | `src/components/ui/`                    | All available                                                                                    |
| Explorer placeholder   | `src/app/explorer/page.tsx`             | Has layout structure to expand                                                                   |

---

## Non-Goals

**Verdict: Specific enough.** 11 non-goals, well-bounded:

- Executive Overview (SPEC-003)
- Anomalies page
- API routes (SPEC-001)
- FilterBar (SPEC-002)
- Advanced table features (resize, select, inline edit)
- Drill to individual claims
- Mobile responsive
- Export/download
- KPI summary row (Overview owns KPIs)
- Dark mode
- Days Supply as full filter dimension

---

## Implicit Decisions

1. **Chart component reuse vs duplication**: SPEC-003 and SPEC-004 both use stacked area charts, donut charts, and horizontal bar charts. The implementor can either (a) extract shared components (e.g., `<HorizontalBarChart>`) or (b) duplicate with slight variations. Given timeline, duplication is fine — but if extracting, do it during SPEC-003 so SPEC-004 can import.

2. **Three-column layout**: The spec says "exact layout proportions at implementor's discretion." Drug table should be widest (~50%). Days Supply + MONY stack in the remaining space. A reasonable approach: `grid grid-cols-3` with drug table at `col-span-2`, days supply and MONY in `col-span-1` stacked vertically.

3. **ClaimsResponse includes kpis/unfilteredKpis**: The Explorer page structure has NO KPI cards (non-goal), but the API response includes them. Use for insight generation only (e.g., "filtered claims represent X% of total").

4. **Drug table pagination is API-driven**: The `limit` param changes the API request (Top 20 vs Top 50), causing a re-fetch. This is different from client-side pagination. The toggle should be in the Card header, and changing it triggers a new fetch.

---

## Verdict: READY

All 17 ACs pass quality check. No blocking issues. Dependencies are sequential (SPEC-002 → SPEC-003 → SPEC-004) and on track.

**Implementor notes:**

1. Use `labelName` for drug name tooltip content (falls back to `drugName` if null)
2. Days Supply click = visual highlight only, NOT a filter toggle — make the distinction obvious
3. Build AFTER SPEC-003 — needs `format.ts` and `generate-insights.ts` to exist
4. Drug table pagination is API-driven (`limit` param), not client-side
5. Consider extracting shared chart components during SPEC-003 for reuse here
6. `@tanstack/react-table` v8 is installed — use the headless hooks pattern with shadcn Table
