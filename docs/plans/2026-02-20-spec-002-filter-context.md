# SPEC-002: FilterContext, FilterBar & URL Sync — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Global filter state with bidirectional URL sync, sticky filter bar with dropdowns/comboboxes/chips, and flagged NDC toggle — powering cross-filtering for SPEC-003/004.

**Architecture:** FilterProvider context wraps `<main>` in layout.tsx (with Suspense). Each page renders its own `<FilterBar view="..." />`. Filter options fetched once via `useFilterOptions` hook with module-level cache. URL sync via `useSearchParams` + `useRouter` with 200ms debounce. URL keys match `parse-filters.ts` exactly.

**Tech Stack:** Next.js 14 App Router, next/navigation (useSearchParams, useRouter, usePathname), shadcn/ui (Select, Command, Popover, Switch, Badge, Button), TypeScript

**Spec:** `docs/specs/SPEC-002-filter-context.md` (20 ACs)
**Spec-Check:** `docs/specs/SPEC-002-spec-check.md` (READY)

**Vercel Best Practices Applied:**
- `async-suspense-boundaries` — Suspense wrapping FilterProvider (required for `useSearchParams()`)
- `bundle-barrel-imports` — lucide-react covered by `optimizePackageImports` in next.config.ts; shadcn imports are direct file imports
- `server-serialization` — pages stay server components, FilterBar is client, no data serialized as props
- `rerender-memo-with-default-value` — all lookup objects (`MONY_LABELS`, `FILTER_KEYS`, etc.) hoisted to module scope
- `rerender-derived-state-no-effect` — `activeFilterCount` derived in `useMemo` during render, not in an effect
- `rendering-conditional-render` — use ternary `? : null` instead of `&&` for JSX conditionals
- `advanced-init-once` — module-level cache + deduplicated fetch promise in `useFilterOptions`
- `rerender-functional-setstate` — stable callbacks via `useCallback` with `pendingRef` accumulation pattern

---

## Task 1: Create FilterContext Provider

**Files:**
- Create: `src/contexts/filter-context.tsx`

**What it does:**
- Defines `FilterState` (extends `FilterParams` from `api-types.ts`, makes `includeFlaggedNdcs` required)
- Provides `useFilters()` hook returning: `filters`, `setFilter`, `removeFilter`, `toggleFilter`, `toggleFlaggedNdcs`, `clearAll`, `activeFilterCount`
- Reads URL search params on mount → hydrates filter state
- Writes URL search params on change with 200ms debounce via `router.push()`
- Back/forward navigation works because each debounced push creates a history entry

**Key design decisions:**
- `FilterState` extends `FilterParams` (don't redefine — spec-check note #2)
- URL keys match `parse-filters.ts` exactly (spec-check note #3)
- Uses `pendingRef` to accumulate rapid changes during debounce window — this means two rapid `setFilter` calls coalesce correctly
- `filtersFromParams()` mirrors `parseFilters()` logic from `parse-filters.ts` — same key names, same `flagged` → `includeFlaggedNdcs` mapping
- `filtersToParams()` only writes non-undefined values — no empty params in URL
- Next.js `router.push()` already uses transitions internally, so no explicit `startTransition` needed (per PERFORMANCE.md discussion)

**Step 1: Write the file**

```tsx
// src/contexts/filter-context.tsx
'use client';

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { FilterParams } from '@/lib/api-types';

// FilterState = FilterParams but with includeFlaggedNdcs required (defaults false)
export interface FilterState extends Omit<FilterParams, 'includeFlaggedNdcs'> {
  includeFlaggedNdcs: boolean;
}

export type FilterKey = keyof Omit<FilterState, 'entityId' | 'includeFlaggedNdcs'>;

// These MUST match parse-filters.ts URL param names exactly
const FILTER_KEYS: FilterKey[] = [
  'formulary',
  'state',
  'mony',
  'manufacturer',
  'drug',
  'ndc',
  'dateStart',
  'dateEnd',
  'groupId',
];

interface FilterContextValue {
  filters: FilterState;
  setFilter: (key: FilterKey, value: string) => void;
  removeFilter: (key: FilterKey) => void;
  toggleFilter: (key: FilterKey, value: string) => void;
  toggleFlaggedNdcs: () => void;
  clearAll: () => void;
  activeFilterCount: number;
}

const FilterContext = createContext<FilterContextValue | null>(null);

function filtersFromParams(searchParams: URLSearchParams): FilterState {
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

function filtersToParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== '') {
      params.set(key, value);
    }
  }
  if (filters.includeFlaggedNdcs) {
    params.set('flagged', 'true');
  }
  return params;
}

export function FilterProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<FilterState | null>(null);

  // Derive filter state from current URL search params (rerender-derived-state-no-effect)
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  // Push URL with 200ms debounce — accumulates rapid changes into one history entry
  const pushUrl = useCallback(
    (next: FilterState) => {
      pendingRef.current = next;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = filtersToParams(pendingRef.current!);
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
        pendingRef.current = null;
      }, 200);
    },
    [router, pathname],
  );

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const base = pendingRef.current ?? filters;
      pushUrl({ ...base, [key]: value || undefined });
    },
    [filters, pushUrl],
  );

  const removeFilter = useCallback(
    (key: FilterKey) => {
      const base = pendingRef.current ?? filters;
      pushUrl({ ...base, [key]: undefined });
    },
    [filters, pushUrl],
  );

  const toggleFilter = useCallback(
    (key: FilterKey, value: string) => {
      const base = pendingRef.current ?? filters;
      pushUrl({ ...base, [key]: base[key] === value ? undefined : value });
    },
    [filters, pushUrl],
  );

  const toggleFlaggedNdcs = useCallback(() => {
    const base = pendingRef.current ?? filters;
    pushUrl({ ...base, includeFlaggedNdcs: !base.includeFlaggedNdcs });
  }, [filters, pushUrl]);

  const clearAll = useCallback(() => {
    pushUrl({ entityId: 1, includeFlaggedNdcs: false });
  }, [pushUrl]);

  // Derived count — not stored in state (rerender-derived-state-no-effect)
  const activeFilterCount = useMemo(() => {
    return FILTER_KEYS.filter((key) => filters[key] !== undefined).length;
  }, [filters]);

  const value = useMemo<FilterContextValue>(
    () => ({
      filters,
      setFilter,
      removeFilter,
      toggleFilter,
      toggleFlaggedNdcs,
      clearAll,
      activeFilterCount,
    }),
    [filters, setFilter, removeFilter, toggleFilter, toggleFlaggedNdcs, clearAll, activeFilterCount],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `filter-context.tsx`

**Step 3: Commit**

```bash
git add src/contexts/filter-context.tsx
git commit -m "feat(SPEC-002): add FilterContext provider with URL sync"
```

**Covers ACs:** 1, 2, 3, 4, 5, 6, 7, 8, 15, 17, 19

---

## Task 2: Create useFilterOptions Hook

**Files:**
- Create: `src/hooks/use-filter-options.ts`

**What it does:**
- Fetches `/api/filters` once on first mount
- Module-level cache + deduplicated promise (`advanced-init-once` pattern) — survives re-renders, tab switches, page navigation
- Returns `{ drugs, manufacturers, groups, loading, error }`
- On failure: sets error message, clears promise to allow retry on next mount (spec AC 20)

**Step 1: Write the file**

```tsx
// src/hooks/use-filter-options.ts
'use client';

import { useState, useEffect } from 'react';
import type { FiltersResponse } from '@/lib/api-types';

interface FilterOptionsResult {
  drugs: string[];
  manufacturers: string[];
  groups: string[];
  loading: boolean;
  error: string | null;
}

// Module-level cache — fetched once per app lifecycle (advanced-init-once)
let cached: FiltersResponse | null = null;
let fetchPromise: Promise<FiltersResponse> | null = null;

export function useFilterOptions(): FilterOptionsResult {
  const [data, setData] = useState<FiltersResponse | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cached) return;

    // Deduplicate concurrent calls — second mount reuses the same promise
    if (!fetchPromise) {
      fetchPromise = fetch('/api/filters')
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load filter options (${res.status})`);
          return res.json() as Promise<FiltersResponse>;
        })
        .then((result) => {
          cached = result;
          return result;
        });
    }

    let cancelled = false;
    fetchPromise
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load options');
          setLoading(false);
        }
        fetchPromise = null; // Allow retry on next mount
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    drugs: data?.drugs ?? [],
    manufacturers: data?.manufacturers ?? [],
    groups: data?.groups ?? [],
    loading,
    error,
  };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `use-filter-options.ts`

**Step 3: Commit**

```bash
git add src/hooks/use-filter-options.ts
git commit -m "feat(SPEC-002): add useFilterOptions hook with module-level cache"
```

**Covers ACs:** 11 (fetch + cache), 20 (error handling)

---

## Task 3: Create FilterBar Component

**Files:**
- Create: `src/components/filter-bar.tsx`

**What it does:**
- Renders horizontal filter bar with `sticky top-0 z-10`
- Base dropdowns (both views): Formulary, State, MONY, Date Range
- Explorer-only searchable comboboxes: Drug Name, Manufacturer, Group ID
- Chip pills row showing active filters with remove buttons
- "Clear All" button when any filter is active
- Flagged NDC toggle (Switch) on the right side

**Key design decisions:**
- All lookup objects hoisted to module scope (`rerender-memo-with-default-value`)
- Ternary for all conditional renders (`rendering-conditional-render`)
- Select dropdowns use shadcn Select (Radix) — deselection via chip X or Clear All only
- Searchable comboboxes use Command + Popover with `shouldFilter={false}` (we filter client-side for match count display)
- Results capped at 100 items for rendering performance (5,600 drugs)
- Date range uses native `<input type="date">` — simple, no extra dependency
- Date chips combined into one "Date: Mar 2021 – Sep 2021" when both set
- MONY chips show full label: `"MONY: O (Generic Multi)"`
- FilterChips extracted as a sub-component for clarity

**Step 1: Write the file**

```tsx
// src/components/filter-bar.tsx
'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useFilters, type FilterKey } from '@/contexts/filter-context';
import { useFilterOptions } from '@/hooks/use-filter-options';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

// ── Module-scope constants (rerender-memo-with-default-value) ───────────

interface FilterBarProps {
  view: 'overview' | 'explorer';
}

const MONY_LABELS: Record<string, string> = {
  M: 'Multi-Source Brand',
  O: 'Multi-Source Generic',
  N: 'Single-Source Brand',
  Y: 'Single-Source Generic',
};

const MONY_SHORT: Record<string, string> = {
  M: 'Brand Multi',
  O: 'Generic Multi',
  N: 'Brand Single',
  Y: 'Generic Single',
};

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// ── Searchable Combobox ─────────────────────────────────────────────────

function SearchableCombobox({
  label,
  options,
  value,
  onSelect,
  loading,
  error,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onSelect: (value: string | undefined) => void;
  loading: boolean;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    : options;
  const display = filtered.slice(0, 100);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          size="sm"
          className="w-[180px] justify-between font-normal"
        >
          <span className="truncate">{value ?? `All ${label}s`}</span>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${label.toLowerCase()}s...`}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {error ? (
              <CommandEmpty>Failed to load options</CommandEmpty>
            ) : loading ? (
              <CommandEmpty>Loading...</CommandEmpty>
            ) : display.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup
                heading={
                  search
                    ? `${filtered.length} of ${options.length.toLocaleString()} ${label.toLowerCase()}s`
                    : `${options.length.toLocaleString()} ${label.toLowerCase()}s`
                }
              >
                {display.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => {
                      onSelect(option === value ? undefined : option);
                      setOpen(false);
                      setSearch('');
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-3.5 w-3.5',
                        value === option ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="truncate">{option}</span>
                  </CommandItem>
                ))}
                {filtered.length > 100 ? (
                  <p className="text-muted-foreground px-2 py-1.5 text-xs">
                    Type to narrow {filtered.length.toLocaleString()} results...
                  </p>
                ) : null}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Chip Pills ──────────────────────────────────────────────────────────

function FilterChips() {
  const { filters, removeFilter, clearAll, activeFilterCount } = useFilters();

  if (activeFilterCount === 0) return null;

  const chips: { key: FilterKey; label: string; display: string }[] = [];

  // Date range: combine into one chip if both set, otherwise separate
  if (filters.dateStart && filters.dateEnd) {
    chips.push({
      key: 'dateStart',
      label: 'Date',
      display: `${formatDateLabel(filters.dateStart)} – ${formatDateLabel(filters.dateEnd)}`,
    });
  } else if (filters.dateStart) {
    chips.push({
      key: 'dateStart',
      label: 'From',
      display: formatDateLabel(filters.dateStart),
    });
  } else if (filters.dateEnd) {
    chips.push({
      key: 'dateEnd',
      label: 'To',
      display: formatDateLabel(filters.dateEnd),
    });
  }

  // Dimension chips
  const dimensions: { key: FilterKey; label: string; format?: (v: string) => string }[] = [
    { key: 'formulary', label: 'Formulary' },
    { key: 'state', label: 'State' },
    { key: 'mony', label: 'MONY', format: (v) => `${v} (${MONY_SHORT[v] ?? v})` },
    { key: 'drug', label: 'Drug' },
    { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'groupId', label: 'Group' },
    { key: 'ndc', label: 'NDC' },
  ];

  for (const { key, label, format } of dimensions) {
    const val = filters[key];
    if (val !== undefined) {
      chips.push({ key, label, display: format ? format(val) : val });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 px-6 py-2">
      {chips.map(({ key, label, display }) => (
        <Badge
          key={key}
          variant="secondary"
          className="gap-1 pr-1 transition-all duration-150"
        >
          <span className="text-muted-foreground text-xs">{label}:</span>
          <span className="text-xs">{display}</span>
          <button
            onClick={() => {
              removeFilter(key);
              // Combined date chip — remove both dates
              if (key === 'dateStart' && filters.dateEnd && filters.dateStart) {
                removeFilter('dateEnd');
              }
            }}
            className="hover:bg-muted ml-0.5 rounded-full p-0.5"
            aria-label={`Remove ${label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="xs"
        onClick={clearAll}
        className="text-muted-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}

// ── Main FilterBar ──────────────────────────────────────────────────────

export function FilterBar({ view }: FilterBarProps) {
  const { filters, setFilter, removeFilter, toggleFlaggedNdcs } = useFilters();
  const filterOptions = useFilterOptions();

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white">
      {/* Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-3">
        {/* Formulary */}
        <Select
          value={filters.formulary}
          onValueChange={(val) => setFilter('formulary', val)}
        >
          <SelectTrigger className="w-[150px]" size="sm">
            <SelectValue placeholder="All Formularies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OPEN">OPEN</SelectItem>
            <SelectItem value="MANAGED">MANAGED</SelectItem>
            <SelectItem value="HMF">HMF</SelectItem>
          </SelectContent>
        </Select>

        {/* State */}
        <Select
          value={filters.state}
          onValueChange={(val) => setFilter('state', val)}
        >
          <SelectTrigger className="w-[130px]" size="sm">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CA">CA</SelectItem>
            <SelectItem value="IN">IN</SelectItem>
            <SelectItem value="KS">KS</SelectItem>
            <SelectItem value="MN">MN</SelectItem>
            <SelectItem value="PA">PA</SelectItem>
          </SelectContent>
        </Select>

        {/* MONY */}
        <Select
          value={filters.mony}
          onValueChange={(val) => setFilter('mony', val)}
        >
          <SelectTrigger className="w-[200px]" size="sm">
            <SelectValue placeholder="All MONY" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MONY_LABELS).map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {code} — {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range */}
        <div className="flex items-center gap-1">
          <input
            type="date"
            value={filters.dateStart ?? ''}
            min="2021-01-01"
            max={filters.dateEnd ?? '2021-12-31'}
            onChange={(e) =>
              e.target.value
                ? setFilter('dateStart', e.target.value)
                : removeFilter('dateStart')
            }
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            aria-label="Start date"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="date"
            value={filters.dateEnd ?? ''}
            min={filters.dateStart ?? '2021-01-01'}
            max="2021-12-31"
            onChange={(e) =>
              e.target.value
                ? setFilter('dateEnd', e.target.value)
                : removeFilter('dateEnd')
            }
            className="border-input bg-background h-8 rounded-md border px-2 text-sm"
            aria-label="End date"
          />
        </div>

        {/* Explorer-only: Drug, Manufacturer, Group comboboxes (rendering-conditional-render) */}
        {view === 'explorer' ? (
          <>
            <div className="bg-border mx-1 h-6 w-px" />
            <SearchableCombobox
              label="Drug"
              options={filterOptions.drugs}
              value={filters.drug}
              onSelect={(val) => (val ? setFilter('drug', val) : removeFilter('drug'))}
              loading={filterOptions.loading}
              error={filterOptions.error}
            />
            <SearchableCombobox
              label="Manufacturer"
              options={filterOptions.manufacturers}
              value={filters.manufacturer}
              onSelect={(val) =>
                val ? setFilter('manufacturer', val) : removeFilter('manufacturer')
              }
              loading={filterOptions.loading}
              error={filterOptions.error}
            />
            <SearchableCombobox
              label="Group"
              options={filterOptions.groups}
              value={filters.groupId}
              onSelect={(val) => (val ? setFilter('groupId', val) : removeFilter('groupId'))}
              loading={filterOptions.loading}
              error={filterOptions.error}
            />
          </>
        ) : null}

        {/* Flagged NDC Toggle — right-aligned */}
        <div className="ml-auto flex items-center gap-2">
          <Switch
            checked={filters.includeFlaggedNdcs}
            onCheckedChange={toggleFlaggedNdcs}
            id="flagged-toggle"
            size="sm"
          />
          <label
            htmlFor="flagged-toggle"
            className={cn(
              'cursor-pointer whitespace-nowrap text-xs',
              filters.includeFlaggedNdcs
                ? 'font-medium text-amber-600'
                : 'text-muted-foreground',
            )}
          >
            {filters.includeFlaggedNdcs ? 'Flagged NDCs included' : 'Include flagged NDCs'}
          </label>
        </div>
      </div>

      {/* Chip Pills Row */}
      <FilterChips />
    </div>
  );
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors related to `filter-bar.tsx`

**Step 3: Commit**

```bash
git add src/components/filter-bar.tsx
git commit -m "feat(SPEC-002): add FilterBar with dropdowns, comboboxes, chips, flagged toggle"
```

**Covers ACs:** 9, 10, 11, 12, 13, 14, 16, 18, 20

---

## Task 4: Integrate into Layout + Pages

**Files:**
- Modify: `src/app/layout.tsx` — add FilterProvider + Suspense, remove `p-6` from main
- Modify: `src/app/page.tsx` — add FilterBar, wrap content in `p-6`
- Modify: `src/app/explorer/page.tsx` — replace static filter divs with FilterBar, wrap content in `p-6`
- Modify: `src/app/anomalies/page.tsx` — wrap content in `p-6` (no FilterBar)
- Modify: `src/app/process/page.tsx` — wrap content in `p-6` (no FilterBar)

**Key decisions:**
- FilterProvider in layout.tsx, FilterBar per-page (spec-check note #1)
- `p-6` moves from `<main>` to each page's content wrapper so FilterBar spans full width and sticks correctly
- Suspense wraps FilterProvider (required for `useSearchParams()` in Next.js 14 — `async-suspense-boundaries`)
- Pages stay server components — they import FilterBar (client) but don't use hooks themselves (`server-serialization`)

**Step 1: Modify layout.tsx**

Full replacement:

```tsx
// src/app/layout.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Sidebar } from '@/components/sidebar';
import { FilterProvider } from '@/contexts/filter-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SPS Health — Pharmacy A Claims Analysis',
  description:
    'Interactive claims analytics dashboard for SPS Health RFP evaluation — Pharmacy A 2021 utilization data',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <TooltipProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <Suspense>
              <FilterProvider>
                <main className="bg-muted/30 flex-1 overflow-y-auto">{children}</main>
              </FilterProvider>
            </Suspense>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
```

**Step 2: Modify page.tsx (Overview)**

```tsx
// src/app/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/filter-bar';

export default function OverviewPage() {
  return (
    <>
      <FilterBar view="overview" />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Overview</h1>
          <p className="text-muted-foreground">Pharmacy A — 2021 Claims Utilization Summary</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Total Claims', value: '—' },
            { title: 'Net Claims', value: '—' },
            { title: 'Reversal Rate', value: '—' },
            { title: 'Unique Drugs', value: '—' },
          ].map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Monthly Claims Trend</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Claims by Formulary</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Claims by State</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Adjudication Rates</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
```

**Step 3: Modify explorer/page.tsx**

Remove the static filter bar Card. Add FilterBar with `view="explorer"`.

```tsx
// src/app/explorer/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar } from '@/components/filter-bar';

export default function ExplorerPage() {
  return (
    <>
      <FilterBar view="explorer" />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Claims Explorer</h1>
          <p className="text-muted-foreground">Filter and drill into claims by any dimension</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Drugs by Volume</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Days Supply Distribution</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground flex h-80 items-center justify-center">
              Chart component — coming next
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reversal Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground flex h-64 items-center justify-center">
            Chart component — coming next
          </CardContent>
        </Card>
      </div>
    </>
  );
}
```

**Step 4: Modify anomalies/page.tsx** — add `p-6` to outer div

Change `className="space-y-6"` → `className="space-y-6 p-6"` on the root div.

**Step 5: Modify process/page.tsx** — add `p-6` to outer div

Change `className="space-y-6"` → `className="space-y-6 p-6"` on the root div.

**Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -30`
Expected: No errors

**Step 7: Start dev server and visually verify**

Run: `npm run dev`

Checklist:
- [ ] Overview (`/`): FilterBar with Formulary, State, MONY, Date Range + flagged toggle
- [ ] Explorer (`/explorer`): Same dropdowns + Drug, Manufacturer, Group comboboxes
- [ ] Anomalies (`/anomalies`): No FilterBar, content has normal padding
- [ ] Process (`/process`): No FilterBar, content has normal padding
- [ ] Select a filter → chip appears, URL updates
- [ ] Click chip X → filter removed, URL updates
- [ ] Toggle flagged → amber label, `?flagged=true` in URL
- [ ] Clear All → all filters reset, URL clean
- [ ] Back button → previous filter state restored

**Step 8: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/explorer/page.tsx src/app/anomalies/page.tsx src/app/process/page.tsx
git commit -m "feat(SPEC-002): integrate FilterProvider in layout, FilterBar per-page"
```

**Covers ACs:** All 20 ACs fully covered across Tasks 1–4

---

## Task 5: Final Verification + Push

**Step 1: Full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: Clean

**Step 2: Build check**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Push to main for Mac verification**

```bash
git push origin main
```

---

## AC Coverage Matrix

| AC | Description | Task |
|----|-------------|------|
| 1 | FilterProvider + useFilters() hook | 1 |
| 2 | useFilters() returns all 7 members | 1 |
| 3 | setFilter → state + URL | 1 |
| 4 | removeFilter → clears state + URL | 1 |
| 5 | toggleFilter → set/unset toggle | 1 |
| 6 | clearAll → resets all + URL + flagged | 1 |
| 7 | URL hydration on mount | 1 |
| 8 | Back/forward navigation (history entries) | 1 |
| 9 | FilterBar overview: 4 dropdowns | 3, 4 |
| 10 | FilterBar explorer: +3 comboboxes | 3, 4 |
| 11 | Comboboxes fetch /api/filters, filter client-side | 2, 3 |
| 12 | Chip pills with label + value | 3 |
| 13 | Clear All visible + resets all | 3 |
| 14 | Sticky top-0 | 3 |
| 15 | Debounce >= 200ms | 1 |
| 16 | Flagged toggle on right, default OFF | 3 |
| 17 | Toggle → flaggedNdcs + URL | 1, 3 |
| 18 | Amber label when ON | 3 |
| 19 | clearAll resets flagged toggle | 1 |
| 20 | Failed fetch → empty + message | 2, 3 |
