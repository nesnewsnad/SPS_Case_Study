# CSV Export — Overview & Explorer

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a CSV export button to Overview and Explorer views that downloads the currently displayed data (respecting active filters) as a multi-section CSV with metadata header.

**Architecture:** Client-side only. A `downloadCsv()` utility takes typed section arrays, formats them as CSV with a metadata preamble (date, filters, entity), creates a Blob, and triggers a browser download via anchor click. Each page maps its existing `data` state into sections — no new API calls.

**Tech Stack:** No new dependencies. Hand-rolled CSV formatting. Vitest for unit tests. lucide-react `Download` icon (already installed).

---

### Task 1: Write export-csv utility — tests first

**Files:**

- Create: `src/lib/__tests__/export-csv.test.ts`
- Create: `src/lib/export-csv.ts`

**Step 1: Write failing tests**

Create `src/lib/__tests__/export-csv.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { formatCsvContent } from '@/lib/export-csv';

describe('formatCsvContent', () => {
  it('renders metadata header with # prefix', () => {
    const result = formatCsvContent({
      title: 'Executive Overview',
      filters: 'state=CA',
      entity: 'Pharmacy A',
      sections: [],
    });
    expect(result).toContain('# SPS Health — Executive Overview Export');
    expect(result).toContain('# Filters: state=CA');
    expect(result).toContain('# Entity: Pharmacy A');
    expect(result).toMatch(/^# Date: \d{4}-\d{2}-\d{2}/m);
  });

  it('shows "None" when no filters active', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [],
    });
    expect(result).toContain('# Filters: None');
  });

  it('renders a single section with headers and rows', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        {
          heading: 'KPI Summary',
          headers: ['Metric', 'Value'],
          rows: [
            ['Total Claims', '546,523'],
            ['Net Claims', '428,886'],
          ],
        },
      ],
    });
    expect(result).toContain('KPI Summary');
    expect(result).toContain('Metric,Value');
    expect(result).toContain('"Total Claims","546,523"');
    expect(result).toContain('"Net Claims","428,886"');
  });

  it('separates multiple sections with blank lines', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        { heading: 'Section A', headers: ['A'], rows: [['1']] },
        { heading: 'Section B', headers: ['B'], rows: [['2']] },
      ],
    });
    const lines = result.split('\n');
    // Find blank line between sections
    const sectionBIdx = lines.findIndex((l) => l === 'Section B');
    expect(lines[sectionBIdx - 1]).toBe('');
  });

  it('escapes values containing commas', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        {
          heading: 'Test',
          headers: ['Name'],
          rows: [['Hydrocodone-APAP, 5-325mg']],
        },
      ],
    });
    expect(result).toContain('"Hydrocodone-APAP, 5-325mg"');
  });

  it('escapes values containing double quotes', () => {
    const result = formatCsvContent({
      title: 'Test',
      filters: '',
      entity: 'Pharmacy A',
      sections: [
        {
          heading: 'Test',
          headers: ['Name'],
          rows: [['Drug "Special"']],
        },
      ],
    });
    expect(result).toContain('"Drug ""Special"""');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/__tests__/export-csv.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

Create `src/lib/export-csv.ts`:

```typescript
export interface CsvSection {
  heading: string;
  headers: string[];
  rows: string[][];
}

interface CsvExportOptions {
  title: string;
  filters: string;
  entity: string;
  sections: CsvSection[];
}

function escapeCell(value: string): string {
  // Always quote cells — safe for commas, quotes, newlines
  return `"${value.replace(/"/g, '""')}"`;
}

export function formatCsvContent(options: CsvExportOptions): string {
  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# SPS Health — ${options.title} Export`,
    `# Date: ${date}`,
    `# Filters: ${options.filters || 'None'}`,
    `# Entity: ${options.entity}`,
    '',
  ];

  for (let i = 0; i < options.sections.length; i++) {
    if (i > 0) lines.push('');
    const section = options.sections[i];
    lines.push(section.heading);
    lines.push(section.headers.join(','));
    for (const row of section.rows) {
      lines.push(row.map(escapeCell).join(','));
    }
  }

  return lines.join('\n');
}

export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/__tests__/export-csv.test.ts`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add src/lib/export-csv.ts src/lib/__tests__/export-csv.test.ts
git commit -m "feat: add CSV export utility with tests"
```

---

### Task 2: Add export button to Executive Overview

**Files:**

- Modify: `src/app/page.tsx`

**Step 1: Add import**

Add to the existing imports at top of file:

```typescript
import { Download } from 'lucide-react';
import { formatCsvContent, downloadCsv } from '@/lib/export-csv';
import type { CsvSection } from '@/lib/export-csv';
```

**Step 2: Add export handler**

Inside the `OverviewPage` component, after the existing `useMemo` / `useCallback` hooks and before the early returns, add:

```typescript
const handleExport = useCallback(() => {
  if (!data) return;
  const sections: CsvSection[] = [
    {
      heading: 'KPI Summary',
      headers: ['Metric', 'Value'],
      rows: [
        ['Total Claims', formatNumber(data.kpis.totalClaims)],
        ['Net Claims', formatNumber(data.kpis.netClaims)],
        ['Reversal Rate', formatPercent(data.kpis.reversalRate)],
        ['Unique Drugs', formatNumber(data.kpis.uniqueDrugs)],
      ],
    },
    {
      heading: 'Monthly Trend',
      headers: ['Month', 'Incurred', 'Reversed'],
      rows: data.monthly.map((m) => [m.month, String(m.incurred), String(m.reversed)]),
    },
    {
      heading: 'Formulary Breakdown',
      headers: ['Type', 'Net Claims', 'Reversal Rate'],
      rows: data.formulary.map((f) => [
        f.type,
        formatNumber(f.netClaims),
        formatPercent(f.reversalRate),
      ]),
    },
    {
      heading: 'Claims by State',
      headers: ['State', 'Total Claims', 'Net Claims', 'Reversal Rate', 'Group Count'],
      rows: data.allStates.map((s) => [
        s.state,
        formatNumber(s.totalClaims),
        formatNumber(s.netClaims),
        formatPercent(s.reversalRate),
        String(s.groupCount),
      ]),
    },
    {
      heading: 'Adjudication',
      headers: ['Metric', 'Value'],
      rows: [
        ['Adjudicated', formatNumber(data.adjudication.adjudicated)],
        ['Not Adjudicated', formatNumber(data.adjudication.notAdjudicated)],
        ['Rate', formatPercent(data.adjudication.rate)],
      ],
    },
  ];
  const content = formatCsvContent({
    title: 'Executive Overview',
    filters: ctx,
    entity: 'Pharmacy A',
    sections,
  });
  downloadCsv('sps-overview.csv', content);
}, [data, ctx]);
```

Note: `ctx` is the existing `filterContext(filters)` variable already computed in the component. Find where it's defined (should be something like `const ctx = filterContext(filters);`) — the handler references it for the metadata header.

**Step 3: Add button to header**

Find the loaded-state header section (the one with `stagger-children`, NOT the loading/error states). It looks like:

```tsx
<div>
  <h1 className="text-2xl font-bold tracking-tight">Executive Overview</h1>
  <p className="text-muted-foreground text-sm">
    {ctx ? `Pharmacy A — ${ctx}` : 'Pharmacy A — 2021 Claims Utilization Summary'}
  </p>
  <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
</div>
```

Replace with:

```tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Executive Overview</h1>
    <p className="text-muted-foreground text-sm">
      {ctx ? `Pharmacy A — ${ctx}` : 'Pharmacy A — 2021 Claims Utilization Summary'}
    </p>
    <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
  </div>
  <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0 gap-1.5">
    <Download className="h-4 w-4" />
    Export CSV
  </Button>
</div>
```

**Step 4: Build and verify**

Run: `npx next build`
Expected: Compiles successfully

**Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add CSV export to Executive Overview"
```

---

### Task 3: Add export button to Claims Explorer

**Files:**

- Modify: `src/app/explorer/page.tsx`

**Step 1: Add import**

Add to existing imports:

```typescript
import { Download } from 'lucide-react';
import { formatCsvContent, downloadCsv } from '@/lib/export-csv';
import type { CsvSection } from '@/lib/export-csv';
```

**Step 2: Add export handler**

Inside the `ExplorerPage` component, after the existing hooks and before early returns, add:

```typescript
const handleExport = useCallback(() => {
  if (!data) return;
  const sections: CsvSection[] = [
    {
      heading: 'KPI Summary',
      headers: ['Metric', 'Value'],
      rows: [
        ['Total Claims', formatNumber(data.kpis.totalClaims)],
        ['Net Claims', formatNumber(data.kpis.netClaims)],
        ['Reversal Rate', formatPercent(data.kpis.reversalRate)],
        ['Unique Drugs', formatNumber(data.kpis.uniqueDrugs)],
      ],
    },
    {
      heading: 'Monthly Trend',
      headers: ['Month', 'Incurred', 'Reversed'],
      rows: data.monthly.map((m) => [m.month, String(m.incurred), String(m.reversed)]),
    },
    {
      heading: 'Top Drugs',
      headers: [
        'Drug Name',
        'Label',
        'NDC',
        'Net Claims',
        'Reversal Rate',
        'Formulary',
        'Top State',
      ],
      rows: data.drugs.map((d) => [
        d.drugName,
        d.labelName ?? '',
        d.ndc,
        formatNumber(d.netClaims),
        formatPercent(d.reversalRate),
        d.formulary,
        d.topState,
      ]),
    },
    {
      heading: 'Days Supply Distribution',
      headers: ['Bin', 'Count'],
      rows: data.daysSupply.map((d) => [d.bin + ' days', formatNumber(d.count)]),
    },
    {
      heading: 'MONY Breakdown',
      headers: ['Type', 'Net Claims'],
      rows: data.mony.map((m) => [m.type, formatNumber(m.netClaims)]),
    },
    {
      heading: 'Top Groups',
      headers: ['Group ID', 'Net Claims'],
      rows: data.topGroups.map((g) => [g.groupId, formatNumber(g.netClaims)]),
    },
    {
      heading: 'Top Manufacturers',
      headers: ['Manufacturer', 'Net Claims'],
      rows: data.topManufacturers.map((m) => [m.manufacturer, formatNumber(m.netClaims)]),
    },
  ];
  const content = formatCsvContent({
    title: 'Claims Explorer',
    filters: ctx,
    entity: 'Pharmacy A',
    sections,
  });
  downloadCsv('sps-explorer.csv', content);
}, [data, ctx]);
```

Note: `ctx` is the existing `filterContext(filters)` variable. Check that it's computed before the handler (it should be — same pattern as Overview).

**Step 3: Add button to header**

Find the loaded-state header (the `stagger-children` block, NOT the loading state):

```tsx
<div>
  <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
  <p className="text-muted-foreground text-sm">
    {ctx ? `Pharmacy A — ${ctx}` : 'Pharmacy A — Drug-Level Drill-Down & Distribution Analysis'}
  </p>
  ...teal bar...
</div>
```

Replace with:

```tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
    <p className="text-muted-foreground text-sm">
      {ctx ? `Pharmacy A — ${ctx}` : 'Pharmacy A — Drug-Level Drill-Down & Distribution Analysis'}
    </p>
    <div className="mt-2 h-0.5 w-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600" />
  </div>
  <Button variant="outline" size="sm" onClick={handleExport} className="shrink-0 gap-1.5">
    <Download className="h-4 w-4" />
    Export CSV
  </Button>
</div>
```

**Step 4: Build and verify**

Run: `npx next build`
Expected: Compiles successfully

**Step 5: Commit**

```bash
git add src/app/explorer/page.tsx
git commit -m "feat: add CSV export to Claims Explorer"
```

---

### Task 4: Run full test suite and push

**Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (existing + 6 new export tests)

**Step 2: Build**

Run: `npx next build`
Expected: Compiles successfully

**Step 3: Push**

```bash
git push
```

**Step 4: Manual verification**

On the deployed site:

1. Overview: click Export CSV with no filters → open file, verify 5 sections with correct headers
2. Overview: filter to state=CA → export → verify metadata line says `Filters: CA`
3. Explorer: click Export CSV → verify drugs table, MONY, groups, manufacturers sections
4. Explorer: filter to MONY=Y → export → verify data reflects filter
5. Open both CSVs in a spreadsheet app — confirm no broken rows, formatting is clean
