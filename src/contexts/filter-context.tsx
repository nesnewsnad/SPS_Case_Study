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
