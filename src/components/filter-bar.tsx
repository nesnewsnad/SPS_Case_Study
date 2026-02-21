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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
          className={cn(
            'w-full justify-between font-normal hover:border-teal-300 md:w-[180px]',
            value
              ? 'border-teal-300 bg-teal-50/50 text-teal-900'
              : 'focus-visible:border-teal-400 focus-visible:ring-teal-400/20',
          )}
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
                {!search && (
                  <CommandItem
                    value={`__all_${label}__`}
                    onSelect={() => {
                      onSelect(undefined);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn('mr-2 h-3.5 w-3.5', !value ? 'opacity-100' : 'opacity-0')}
                    />
                    <span className="text-muted-foreground">All {label}s</span>
                  </CommandItem>
                )}
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
    <div className="border-border/50 flex flex-wrap items-center gap-1.5 border-t px-4 py-2 md:px-6">
      {chips.map(({ key, label, display }) => (
        <Badge
          key={key}
          variant="secondary"
          className="gap-1 border border-teal-200 bg-teal-50 pr-1 text-teal-900 transition-all duration-150"
        >
          <span className="text-xs text-teal-600">{label}:</span>
          <span className="text-xs">{display}</span>
          <button
            onClick={() => {
              removeFilter(key);
              // Combined date chip — remove both dates
              if (key === 'dateStart' && filters.dateEnd && filters.dateStart) {
                removeFilter('dateEnd');
              }
            }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-teal-100"
            aria-label={`Remove ${label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="xs" onClick={clearAll} className="text-muted-foreground">
        Clear all
      </Button>
    </div>
  );
}

// ── Inline Group Label ───────────────────────────────────────────────────

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-muted-foreground hidden text-[10px] font-semibold tracking-[0.08em] uppercase md:inline-block">
      {children}
    </span>
  );
}

// ── Main FilterBar ──────────────────────────────────────────────────────

export function FilterBar({ view }: FilterBarProps) {
  const { filters, setFilter, removeFilter, toggleFlaggedNdcs } = useFilters();
  const filterOptions = useFilterOptions();

  return (
    <div className="glass-header border-border/40 sticky top-0 z-10 border-b">
      {/* Dropdowns Row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 md:px-6">
        {/* ── Dimension Filters ──────────────────────────────── */}
        <div className="contents md:flex md:items-center md:gap-2">
          <GroupLabel>Dimensions</GroupLabel>

          {/* Formulary */}
          <Select
            value={filters.formulary ?? '__all__'}
            onValueChange={(val) =>
              val === '__all__' ? removeFilter('formulary') : setFilter('formulary', val)
            }
          >
            <SelectTrigger
              className={cn(
                'w-[calc(50%-0.25rem)] md:w-[150px]',
                filters.formulary && 'border-teal-300 bg-teal-50/50',
              )}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Formularies</SelectItem>
              <SelectItem value="OPEN">OPEN</SelectItem>
              <SelectItem value="MANAGED">MANAGED</SelectItem>
              <SelectItem value="HMF">HMF</SelectItem>
            </SelectContent>
          </Select>

          {/* State */}
          <Select
            value={filters.state ?? '__all__'}
            onValueChange={(val) =>
              val === '__all__' ? removeFilter('state') : setFilter('state', val)
            }
          >
            <SelectTrigger
              className={cn(
                'w-[calc(50%-0.25rem)] md:w-[130px]',
                filters.state && 'border-teal-300 bg-teal-50/50',
              )}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All States</SelectItem>
              <SelectItem value="CA">CA</SelectItem>
              <SelectItem value="IN">IN</SelectItem>
              <SelectItem value="KS">KS</SelectItem>
              <SelectItem value="MN">MN</SelectItem>
              <SelectItem value="PA">PA</SelectItem>
            </SelectContent>
          </Select>

          {/* MONY */}
          <Select
            value={filters.mony ?? '__all__'}
            onValueChange={(val) =>
              val === '__all__' ? removeFilter('mony') : setFilter('mony', val)
            }
          >
            <SelectTrigger
              className={cn('w-full md:w-[200px]', filters.mony && 'border-teal-300 bg-teal-50/50')}
              size="sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All MONY</SelectItem>
              {Object.entries(MONY_LABELS).map(([code, label]) => (
                <SelectItem key={code} value={code}>
                  {code} — {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Drill-Down Filters (Explorer only) ────────────── */}
        {view === 'explorer' ? (
          <div className="md:border-border/60 contents md:flex md:items-center md:gap-2 md:border-l md:pl-3">
            <GroupLabel>Drill Down</GroupLabel>
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
          </div>
        ) : null}

        {/* ── Flagged NDC Toggle ─────────────────────────────── */}
        <div
          className={cn(
            'flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 transition-colors md:ml-auto md:w-auto',
            filters.includeFlaggedNdcs
              ? 'border-amber-200 bg-amber-50/60'
              : 'border-transparent bg-transparent',
          )}
        >
          <Switch
            checked={filters.includeFlaggedNdcs}
            onCheckedChange={toggleFlaggedNdcs}
            id="flagged-toggle"
            size="sm"
            className="data-[state=checked]:bg-amber-500"
          />
          <label
            htmlFor="flagged-toggle"
            className={cn(
              'cursor-pointer text-xs whitespace-nowrap',
              filters.includeFlaggedNdcs ? 'font-medium text-amber-600' : 'text-muted-foreground',
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
