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
