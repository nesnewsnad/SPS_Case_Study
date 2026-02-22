# Plan: CSV Export per Dashboard View

## Context

The SPS Health dashboard is submission-ready for Monday. Adding a CSV export button to each view turns this from a demo into a tool — evaluators can download the data they're looking at, filtered to their current selection. Low-risk, high-signal feature.

## Scope

- **Overview**, **Explorer**, and **Anomalies** views each get a download button
- Export respects active filters (Overview/Explorer) or exports static data (Anomalies)
- CSV includes a metadata header (export date, active filters, entity name)
- No new dependencies — hand-roll a simple CSV formatter (data is flat)

## Files to Create/Modify

### New files

1. **`src/lib/export-csv.ts`** — utility: `downloadCsv(filename, sections)`
   - Takes an array of `{ title, headers, rows }` sections
   - Prepends metadata block (date, filters, entity)
   - Triggers browser download via Blob + anchor click
   - ~40 lines

2. **`src/lib/__tests__/export-csv.test.ts`** — unit tests for CSV formatting
   - Test: escapes commas/quotes in values
   - Test: multi-section output has blank line separators
   - Test: metadata header is present
   - ~30 lines

### Modified files

3. **`src/app/page.tsx`** (Overview) — add export button + handler
   - Import `downloadCsv` + `Download` icon from lucide
   - Add handler that maps current `data` state → CSV sections (KPIs, monthly, formulary, state, adjudication)
   - Add `<Button>` next to the page title or filter bar area

4. **`src/app/explorer/page.tsx`** (Explorer) — add export button + handler
   - Same pattern: maps `data` → CSV sections (KPIs, monthly, drugs, days supply, MONY, groups, manufacturers)

5. **`src/app/anomalies/page.tsx`** (Anomalies) — add export button + handler
   - Export anomaly panels as sections (title, key stat, narrative text, mini-chart data)

### Export shape per view

**Overview CSV:**

```
# SPS Health — Executive Overview Export
# Date: 2026-02-22
# Filters: state=CA, formulary=OPEN
# Entity: Pharmacy A

KPI Summary
Metric,Value
Total Claims,546523
Net Claims,428886
...

Monthly Trend
Month,Incurred,Reversed
Jan,45231,5012
...

Formulary Breakdown
Type,Net Claims,Reversal Rate
OPEN,234567,10.8%
...
```

**Explorer CSV:** KPIs + monthly + top drugs table + days supply + MONY + groups + manufacturers

**Anomalies CSV:** Panel title + key stat + narrative sections + chart data points

## Button placement

Add a small `<Button variant="outline" size="sm">` with a download icon next to each page's title/header area. Keep it unobtrusive — this is a secondary action.

## Implementation order

1. Write `export-csv.ts` utility
2. Write tests, verify passing
3. Add export to Overview page
4. Add export to Explorer page
5. Add export to Anomalies page
6. Manual test: apply filters, download, open in Excel/Numbers, verify data matches dashboard

## Verification

- `npx vitest run` — all tests pass (69 existing + new export tests)
- Manual: click export on each view with various filter combos
- Open CSV in spreadsheet app — confirm formatting, no broken rows
