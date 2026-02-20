# Spec Check: SPEC-002 — FilterContext, FilterBar & URL Sync

**Checked by:** Mac
**Date:** 2026-02-20

---

## AC Quality

| AC                                                    | Testable | Scoped | Measurable               | Issues                            |
| ----------------------------------------------------- | -------- | ------ | ------------------------ | --------------------------------- |
| 1. FilterProvider + useFilters() hook                 | YES      | YES    | YES                      | —                                 |
| 2. useFilters() returns all 7 members                 | YES      | YES    | YES                      | —                                 |
| 3. setFilter → state + URL                            | YES      | YES    | YES                      | —                                 |
| 4. removeFilter → clears state + URL                  | YES      | YES    | YES                      | —                                 |
| 5. toggleFilter → set/unset toggle                    | YES      | YES    | YES                      | —                                 |
| 6. clearAll → resets all + URL + flagged              | YES      | YES    | YES                      | —                                 |
| 7. URL hydration on mount                             | YES      | YES    | YES                      | —                                 |
| 8. Back/forward navigation                            | YES      | YES    | Needs browser test       | —                                 |
| 9. FilterBar overview: 4 dropdowns                    | YES      | YES    | YES                      | —                                 |
| 10. FilterBar explorer: +3 comboboxes                 | YES      | YES    | YES                      | —                                 |
| 11. Comboboxes fetch /api/filters, filter client-side | YES      | YES    | YES                      | See note 1                        |
| 12. Chip pills with label + value                     | YES      | YES    | YES                      | —                                 |
| 13. Clear All visible when active, resets all         | YES      | YES    | YES                      | —                                 |
| 14. Sticky top-0                                      | YES      | YES    | YES                      | —                                 |
| 15. Debounce >= 200ms                                 | YES      | YES    | Hard to verify precisely | Code review sufficient            |
| 16. Flagged toggle on right, default OFF              | YES      | YES    | YES                      | —                                 |
| 17. Toggle → flaggedNdcs + URL                        | YES      | YES    | YES                      | —                                 |
| 18. Amber label when ON                               | YES      | YES    | YES                      | —                                 |
| 19. clearAll resets flagged toggle                    | YES      | YES    | YES                      | Overlaps AC 6, redundant but fine |
| 20. Failed fetch → empty + message                    | YES      | YES    | YES                      | —                                 |

**All 20 ACs pass quality check.** No vague language, all testable and scoped.

---

## Dependencies

| Dependency                                             | Status                                   |
| ------------------------------------------------------ | ---------------------------------------- |
| SPEC-001 API routes (esp. `/api/filters`)              | **DONE** — verified PASS                 |
| shadcn components (command, popover, switch, skeleton) | **DONE** — installed this session        |
| `FilterParams` type in api-types.ts                    | **EXISTS** — import, don't redefine      |
| `parseFilters()` URL key names                         | **EXISTS** — URL sync MUST use same keys |

---

## Reuse Opportunities

| What                   | Where                        | How to Reuse                                                                                                                                             |
| ---------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FilterParams` type    | `src/lib/api-types.ts`       | `FilterState` is nearly identical — import and extend (add required `includeFlaggedNdcs: boolean`). Do NOT redefine from scratch.                        |
| URL key names          | `src/lib/parse-filters.ts`   | The server reads `?state=`, `?formulary=`, `?flagged=`, etc. The client URL sync must use the exact same keys or API calls will silently ignore filters. |
| `cn()` utility         | `src/lib/utils.ts`           | Standard pattern — all new components import from `@/lib/utils`                                                                                          |
| All shadcn components  | `src/components/ui/`         | Select, Popover, Command, Badge, Button, Switch, Skeleton, ScrollArea — all installed                                                                    |
| Layout injection point | `src/app/layout.tsx`         | FilterProvider wraps inside `<TooltipProvider>`                                                                                                          |
| Sidebar pattern        | `src/components/sidebar.tsx` | Uses `usePathname()`, `"use client"`, `cn()` — same patterns FilterBar needs                                                                             |
| Explorer placeholder   | `src/app/explorer/page.tsx`  | Has static filter divs to replace — card wrapper pattern worth preserving                                                                                |

---

## Non-Goals

**Verdict: Specific enough.** All 6 non-goals have clear boundaries:

- Data fetching (→ SPEC-003/004)
- Chart rendering (→ SPEC-003/004)
- Entity selector interaction (cosmetic only)
- Multi-value filters (single value per dimension)
- Server-side validation
- Mobile responsive

---

## Implicit Decisions

### 1. FilterBar placement vs. `view` prop tension

The spec shows FilterBar inside layout.tsx:

```tsx
<FilterProvider>
  <main>
    <FilterBar view={/* determined per-page */} />
    {children}
  </main>
</FilterProvider>
```

But `view` changes per page, and layout.tsx can't know which page is rendering. The spec says "at the implementor's discretion." **Recommendation**: Put only `FilterProvider` in layout.tsx. Each page renders its own `<FilterBar view="..." />` (or doesn't render it at all for Anomalies/AI Process pages). This is cleaner in Next.js App Router.

### 2. FilterState vs FilterParams type duplication

The spec defines a new `FilterState` interface nearly identical to `FilterParams` from `api-types.ts`. The only difference: `includeFlaggedNdcs` is required `boolean` in FilterState, optional in FilterParams. **Recommendation**: Import `FilterParams` and use `Required<Pick<FilterParams, 'includeFlaggedNdcs'>> & Omit<FilterParams, 'includeFlaggedNdcs'>` — or just define FilterState extending FilterParams. Don't redefine all 11 fields.

### 3. Which pages show FilterBar?

The spec defines `view: "overview" | "explorer"` — only 2 views. What about Anomalies and AI Process? If FilterBar is per-page (recommendation #1), this is moot — those pages simply don't render it. If it's in layout, it needs a hide mechanism. **Not a blocker** — subsequent specs decide.

### 4. /api/filters fetch location

AC 11 says "on first render." The behavior section clarifies: "On mount (app-level, not per-render)." The fetch should happen once in `FilterProvider` or a sibling hook (e.g., `use-filter-options.ts`), NOT inside each combobox. This prevents refetching on tab switches.

---

## Verdict: READY

All 20 ACs are testable, scoped, and measurable. Dependencies are satisfied. No blocking issues. The 4 implicit decisions above are guidance for the implementor, not spec revisions needed.

**Implementor notes to pass to Framework:**

1. Put FilterProvider in layout.tsx, FilterBar per-page (not in layout)
2. Import `FilterParams` from api-types.ts — don't redefine
3. URL keys must match `parse-filters.ts` exactly: `state`, `formulary`, `mony`, `manufacturer`, `drug`, `ndc`, `dateStart`, `dateEnd`, `groupId`, `flagged`
4. Fetch `/api/filters` once at app level, cache in context/hook
