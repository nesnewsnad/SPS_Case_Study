# SPEC-002 — FilterContext, FilterBar & URL Sync

**Date:** 2026-02-19
**Status:** DRAFT
**Dependencies:** None (parallel with SPEC-001)
**Context:** DISCUSS-001 decisions #1, #5, #6

---

## Problem

The dashboard needs a global filter state that:
- Is readable by any component (for API fetch params) and writable by any component (chart clicks, dropdown selects)
- Renders active filters as removable chip pills in a sticky bar
- Syncs to URL query params so views are shareable and the back button works
- Adapts per view — Overview shows base filters, Explorer adds drug/manufacturer/group searchable dropdowns

Nothing exists yet — no context provider, no filter bar, no URL sync.

---

## Behavior

### FilterContext Provider

A React context at `src/contexts/filter-context.tsx` providing:

```typescript
interface FilterState {
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
  includeFlaggedNdcs: boolean;   // default false — excludes FLAGGED_NDCS
}

interface FilterContextValue {
  filters: FilterState;
  setFilter: (key: keyof Omit<FilterState, 'entityId' | 'includeFlaggedNdcs'>, value: string) => void;
  removeFilter: (key: keyof Omit<FilterState, 'entityId' | 'includeFlaggedNdcs'>) => void;
  toggleFilter: (key: keyof Omit<FilterState, 'entityId' | 'includeFlaggedNdcs'>, value: string) => void;
  toggleFlaggedNdcs: () => void;  // flips includeFlaggedNdcs
  clearAll: () => void;
  activeFilterCount: number;
}
```

**Rules:**
- `entityId` always defaults to `1` and is not user-editable (entity selector is locked)
- `includeFlaggedNdcs` defaults to `false` — flagged/test NDCs are excluded from all queries
- `setFilter(key, value)` sets a single filter dimension. If value is empty string, removes the filter.
- `removeFilter(key)` deletes the key from active filters
- `toggleFilter(key, value)` — if the filter already equals `value`, removes it; otherwise sets it. This powers chart cross-filtering (click once to filter, click again to un-filter).
- `toggleFlaggedNdcs()` flips `includeFlaggedNdcs` between true/false
- `clearAll()` removes all filters except `entityId` and resets `includeFlaggedNdcs` to `false`
- `activeFilterCount` is derived — count of non-undefined, non-entityId, non-includeFlaggedNdcs keys (the flagged toggle does NOT count toward active filters)

### URL Sync

Filters sync bidirectionally with URL search params via `next/navigation`:

- **Filters → URL:** When `setFilter`, `removeFilter`, `toggleFilter`, or `clearAll` is called, update the URL search params using `router.replace()` (not `router.push()` — avoid polluting browser history on every filter change).
- **URL → Filters:** On mount and on `popstate` (back/forward), read search params and hydrate `FilterState`.
- **Param format:** `?state=CA&formulary=OPEN&dateStart=2021-03-01&flagged=true`. Only active filters appear — no empty params. `flagged=true` only appears when the toggle is on; absent means off.
- **Debounce:** URL updates are debounced at 200ms to avoid flooding the browser history during rapid filter changes.
- **Shareable:** Copy-pasting the URL into a new tab restores the exact filter state.

### FilterBar Component

A client component at `src/components/filter-bar.tsx`:

```typescript
interface FilterBarProps {
  view: "overview" | "explorer";
}
```

**Layout:**
- Horizontal bar spanning the full content width
- Sticky positioning: `sticky top-0 z-10` so it persists while scrolling the dashboard content
- White background with subtle bottom border (`border-b border-slate-200`)
- Padding consistent with the main content area

**Dropdowns — Base (both views):**

| Filter | Type | Options |
|--------|------|---------|
| Formulary | Select dropdown | OPEN, MANAGED, HMF |
| State | Select dropdown | CA, IN, PA, KS, MN |
| MONY | Select dropdown | M (Multi-Source Brand), O (Multi-Source Generic), N (Single-Source Brand), Y (Single-Source Generic) |
| Date Range | Two date inputs | Start date, End date (YYYY-MM-DD) |

**Dropdowns — Explorer-only (when `view="explorer"`):**

| Filter | Type | Options |
|--------|------|---------|
| Drug Name | Searchable combobox | ~5,600 values from `/api/filters` |
| Manufacturer | Searchable combobox | ~2,400 values from `/api/filters` |
| Group ID | Searchable combobox | ~189 values from `/api/filters` |

**Searchable combobox behavior** (DISCUSS-001 decision #5):
- On mount (app-level, not per-render), fetch `/api/filters` once and cache the response in `FilterContext` or a sibling provider
- Options are filtered client-side as the user types — instant, no debounce, no server call
- Uses shadcn/ui `Combobox` (Command + Popover) pattern
- Popover max-height ~300px with scroll
- Displays the count of matching options while typing (e.g., "23 of 5,640 drugs")

**Select dropdown behavior:**
- Uses shadcn/ui `Select` component
- Static options hardcoded (Formulary: 3 values, State: 5 values, MONY: 4 values)
- Placeholder text when no selection: "All Formularies", "All States", etc.

**Date range behavior:**
- Two native date inputs or shadcn/ui `DatePicker`
- Default: empty (no date filter = full year 2021)
- Start defaults to 2021-01-01 when only end is set; end defaults to 2021-12-31 when only start is set
- Validation: start <= end

**Flagged NDC toggle (all views):**
- Positioned at the right end of the filter bar, visually separated from the dropdowns (e.g., a divider or gap)
- shadcn/ui `Switch` component with label **"Include flagged NDCs"**
- Default: OFF (unchecked) — flagged/test NDCs excluded
- When toggled ON: all views recalculate including flagged NDCs. KPIs change, monthly trend reshapes (May spikes to ~49K), reversal rates shift. The visual delta IS the point — this demonstrates the analyst caught the test data.
- Subtle warning style when ON: switch area gets a faint amber background or the label changes to "Flagged NDCs included" in amber text — visual signal that the data includes test records
- Calls `toggleFlaggedNdcs()` from FilterContext
- Does NOT render as a chip pill (it's a mode toggle, not a filter dimension)
- Does NOT count toward `activeFilterCount`

### Chip Pills

Active filters render as removable pill badges between the dropdown row and the page content:

```
[Formulary: OPEN ✕] [State: CA ✕] [Drug: ATORVASTATIN ✕]    Clear All
```

**Behavior:**
- Each pill shows the dimension label and value: `"State: CA"`
- Click the ✕ or the pill itself → calls `removeFilter(key)`
- "Clear All" button appears only when `activeFilterCount > 0`
- "Clear All" calls `clearAll()` and resets all dropdowns
- Pills animate in/out with a subtle fade (`transition-all duration-150`)
- Use shadcn/ui `Badge` with `variant="secondary"` + close button
- MONY pills show the full label: `"MONY: O (Generic Multi)"` not just `"MONY: O"`
- Date pills show formatted range: `"Date: Mar 2021 – Sep 2021"`

### Cross-Filter Integration

The FilterContext + FilterBar system is the integration point for chart cross-filtering:

- Any chart component calls `toggleFilter(dimension, value)` on click
- The FilterBar reflects the new filter as a chip pill
- The URL updates
- The parent page re-fetches data with the new filter params (data fetching is in SPEC-003/004, not here)

This spec does NOT implement the data fetching — it provides the filter state that SPEC-003 and SPEC-004 consume.

### Provider Placement

`FilterProvider` wraps the page content inside `layout.tsx`, outside the individual page components but inside the sidebar layout:

```tsx
<div className="flex h-screen overflow-hidden">
  <Sidebar />
  <FilterProvider>
    <main className="flex-1 overflow-y-auto bg-muted/30">
      <FilterBar view={/* determined per-page */} />
      <div className="p-6">
        {children}
      </div>
    </main>
  </FilterProvider>
</div>
```

Note: The `FilterBar` sits above the page padding so it can span full width and stick to the top. Each page determines its own `view` prop — the mechanism for this is at the implementor's discretion (a page-level wrapper, a `usePathname()` check, etc.).

---

## File Structure

```
src/
  contexts/
    filter-context.tsx       # FilterProvider, useFilters hook
  components/
    filter-bar.tsx           # FilterBar component (dropdowns + chips)
    filter-chips.tsx         # Chip pills sub-component (optional split)
  hooks/
    use-filter-options.ts    # Fetches and caches /api/filters response
```

The `contexts/` and `hooks/` directories are new. Component split between `filter-bar.tsx` and `filter-chips.tsx` is at implementor's discretion — can be one file.

---

## Acceptance Criteria

1. `FilterProvider` context exists at `src/contexts/filter-context.tsx` and exports `useFilters()` hook
2. `useFilters()` returns `filters`, `setFilter`, `removeFilter`, `toggleFilter`, `clearAll`, and `activeFilterCount`
3. Calling `setFilter('state', 'CA')` updates `filters.state` to `'CA'` and the URL to include `?state=CA`
4. Calling `removeFilter('state')` removes `filters.state` and removes `state=` from the URL
5. Calling `toggleFilter('state', 'CA')` when `filters.state === 'CA'` removes the filter; when `filters.state !== 'CA'` sets it
6. Calling `clearAll()` resets all filters (except `entityId`) and clears URL params
7. Loading a URL with `?state=CA&formulary=OPEN` hydrates the filter state on mount
8. Browser back/forward navigates between filter states
9. `<FilterBar view="overview" />` renders Formulary, State, MONY, and Date Range dropdowns
10. `<FilterBar view="explorer" />` renders all overview dropdowns PLUS searchable Drug Name, Manufacturer, and Group ID comboboxes
11. Searchable comboboxes load options from `/api/filters` on first render and filter client-side as the user types
12. Active filters render as removable chip pills with dimension label and value
13. "Clear All" button appears when any filter is active and resets all filters when clicked
14. FilterBar is sticky (`sticky top-0`) and persists while scrolling page content
15. URL updates are debounced (no history flooding during rapid filter changes)
16. Flagged NDC toggle (`Switch`) renders on the right side of the filter bar on all views, default OFF
17. Toggling the switch calls `toggleFlaggedNdcs()` and adds/removes `?flagged=true` in the URL
18. When the toggle is ON, a subtle amber visual signal indicates test data is included
19. `clearAll()` resets the flagged toggle to OFF along with all other filters

---

## Non-Goals

- Data fetching or API calls from dashboard pages (SPEC-003, SPEC-004)
- Chart rendering or insight generation (SPEC-003, SPEC-004)
- Entity selector interaction (locked to Pharmacy A, cosmetic only)
- Multi-value filters (e.g., selecting both CA and IN at once) — single value per dimension
- Server-side filter validation beyond type checking
- Mobile responsive layout
