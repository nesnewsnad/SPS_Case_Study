import type { FilterState } from '@/contexts/filter-context';
import type { OverviewResponse } from '@/lib/api-types';
import { formatNumber, formatPercent, abbreviateNumber } from '@/lib/format';

export interface InsightCard {
  id: string;
  severity: 'info' | 'warning' | 'positive';
  title: string;
  body: string;
}

interface InsightTemplate {
  id: string;
  priority: number; // lower = higher priority
  match: (filters: FilterState, data: OverviewResponse, view: string) => boolean;
  generate: (filters: FilterState, data: OverviewResponse) => InsightCard;
}

const STATE_NAMES: Record<string, string> = {
  CA: 'California',
  IN: 'Indiana',
  KS: 'Kansas',
  MN: 'Minnesota',
  PA: 'Pennsylvania',
};

function ordinal(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

const templates: InsightTemplate[] = [
  // --- Unfiltered insights (show when no filters active) ---
  {
    id: 'portfolio-summary',
    priority: 10,
    match: (f, _d, v) =>
      v === 'overview' && !f.state && !f.formulary && !f.mony && !f.dateStart && !f.groupId,
    generate: (_f, d) => ({
      id: 'portfolio-summary',
      severity: 'info',
      title: 'Portfolio Summary',
      body: `${abbreviateNumber(d.kpis.netClaims)} net claims across ${d.allStates.length} states and ${d.formulary.length} formulary types. Overall reversal rate: ${formatPercent(d.kpis.reversalRate)}.`,
    }),
  },
  {
    id: 'distribution-channel',
    priority: 11,
    match: (f, _d, v) => v === 'overview' && !f.state && !f.formulary,
    generate: () => ({
      id: 'distribution-channel',
      severity: 'info',
      title: '100% Retail Distribution',
      body: 'All claims are retail (no mail-order), consistent with long-term care pharmacy dispensing patterns where facilities receive frequent, short-cycle fills.',
    }),
  },
  {
    id: 'ltc-pattern',
    priority: 12,
    match: (f, _d, v) => v === 'overview' && !f.dateStart,
    generate: () => ({
      id: 'ltc-pattern',
      severity: 'info',
      title: 'LTC Cycle-Fill Pattern',
      body: 'Day-1-of-month volume is 7–8× the daily average — a strong indicator of long-term care batch dispensing. Days supply clusters at 7 and 14 days.',
    }),
  },

  // --- Per-state: KS batch reversal warning (highest priority) ---
  {
    id: 'state-ks-warning',
    priority: 19,
    match: (f) => f.state === 'KS',
    generate: () => ({
      id: 'state-ks-warning',
      severity: 'warning',
      title: 'August Batch Reversal',
      body: '18 Kansas groups (400xxx prefix) had 100% reversal in August — a batch reversal event. Claims were re-submitted in September at ~1.4× normal volume. Excluding August, KS reversal rate is ~10%, matching other states.',
    }),
  },

  // --- Per-state: rank + share (any state) ---
  {
    id: 'state-rank',
    priority: 20,
    match: (f) => !!f.state,
    generate: (f, d) => {
      const sorted = [...d.allStates].sort((a, b) => b.netClaims - a.netClaims);
      const rank = sorted.findIndex((s) => s.state === f.state) + 1;
      const total = sorted.reduce((sum, s) => sum + s.netClaims, 0);
      const stateData = sorted.find((s) => s.state === f.state);
      const share = total > 0 && stateData ? ((stateData.netClaims / total) * 100).toFixed(1) : '0';
      const name = STATE_NAMES[f.state!] ?? f.state;
      return {
        id: 'state-rank',
        severity: 'info',
        title: `${name} — ${ordinal(rank)} of ${sorted.length}`,
        body: `${f.state} accounts for ${share}% of total claims volume across all states.`,
      };
    },
  },

  // --- Per-state: group density ---
  {
    id: 'state-groups',
    priority: 21,
    match: (f, d) => !!f.state && d.allStates.some((s) => s.state === f.state && s.groupCount > 0),
    generate: (f, d) => {
      const stateData = d.allStates.find((s) => s.state === f.state);
      const groups = stateData?.groupCount ?? 0;
      const net = stateData?.netClaims ?? 0;
      const avg = groups > 0 ? Math.round(net / groups) : 0;
      const totalGroups = d.allStates.reduce((sum, s) => sum + s.groupCount, 0);
      return {
        id: 'state-groups',
        severity: 'info',
        title: `${groups} Groups`,
        body: `${f.state} has ${groups} of ${totalGroups} total groups, averaging ${formatNumber(avg)} claims per group. All groups are state-specific — no group spans multiple states.`,
      };
    },
  },

  // --- Per-month insights ---
  {
    id: 'month-sep',
    priority: 15,
    match: (f) => f.dateStart === '2021-09-01' || f.dateStart?.startsWith('2021-09') === true,
    generate: (_f, d) => {
      const sep = d.monthly.find((m) => m.month === '2021-09');
      const net = sep ? sep.incurred - sep.reversed : 0;
      return {
        id: 'month-sep',
        severity: 'warning',
        title: 'September Surge (+41%)',
        body: `September shows ${formatNumber(net)} net claims — 41% above the normal monthly average. Partially explained by Kansas rebill groups re-incurring, but the spike is uniform across all states and formularies.`,
      };
    },
  },
  {
    id: 'month-nov',
    priority: 16,
    match: (f) => f.dateStart === '2021-11-01' || f.dateStart?.startsWith('2021-11') === true,
    generate: (_f, d) => {
      const nov = d.monthly.find((m) => m.month === '2021-11');
      const net = nov ? nov.incurred - nov.reversed : 0;
      return {
        id: 'month-nov',
        severity: 'warning',
        title: 'November Dip (−54%)',
        body: `November has only ${formatNumber(net)} net claims — 54% below the normal monthly average. The drop is uniform across all states and groups; no missing days or groups explain it.`,
      };
    },
  },
  {
    id: 'month-may',
    priority: 14,
    match: (f) => f.dateStart === '2021-05-01' || f.dateStart?.startsWith('2021-05') === true,
    generate: () => ({
      id: 'month-may',
      severity: 'warning',
      title: 'May — Synthetic Data Alert',
      body: 'May is 99.99% "Kryptonite XR" test drug claims. With flagged NDCs excluded, May has only 5 real claims. This month should be treated as synthetic.',
    }),
  },

  // --- Per-formulary ---
  {
    id: 'formulary-active',
    priority: 25,
    match: (f) => !!f.formulary,
    generate: (f, d) => {
      const match = d.formulary.find((x) => x.type === f.formulary);
      return {
        id: 'formulary-active',
        severity: 'info',
        title: `${f.formulary} Formulary`,
        body: match
          ? `${f.formulary} formulary: ${formatNumber(match.netClaims)} net claims, ${formatPercent(match.reversalRate)} reversal rate. Formulary-level reversal rates are remarkably uniform (~10.7–10.8%).`
          : `Viewing ${f.formulary} formulary claims.`,
      };
    },
  },

  // --- Per-MONY ---
  {
    id: 'mony-y',
    priority: 24,
    match: (f) => f.mony === 'Y',
    generate: (_f, d) => ({
      id: 'mony-y',
      severity: 'positive',
      title: 'Generic Single-Source (Y)',
      body: `Single-source generics represent the bulk of this portfolio at ${formatNumber(d.kpis.netClaims)} net claims in this view. This heavy generic mix indicates effective cost management typical of LTC formulary control.`,
    }),
  },
  {
    id: 'mony-n',
    priority: 24,
    match: (f) => f.mony === 'N',
    generate: (_f, d) => ({
      id: 'mony-n',
      severity: 'info',
      title: 'Brand Single-Source (N)',
      body: `Single-source brands account for ${formatNumber(d.kpis.netClaims)} net claims in this view. These are typically specialty or patented drugs without generic alternatives — important for cost containment strategy.`,
    }),
  },

  // --- Group filter ---
  {
    id: 'group-filter',
    priority: 28,
    match: (f) => !!f.groupId,
    generate: (f, d) => ({
      id: 'group-filter',
      severity: 'info',
      title: `Group ${f.groupId}`,
      body: `Group ${f.groupId}: ${formatNumber(d.kpis.netClaims)} net claims, ${formatPercent(d.kpis.reversalRate)} reversal rate. All groups are state-specific — no group spans multiple states.`,
    }),
  },
];

/**
 * Generate up to `max` insight cards for the current filter + data state.
 * Priority-sorted — most specific match wins.
 */
export function generateInsights(
  filters: FilterState,
  data: OverviewResponse,
  view: string = 'overview',
  max: number = 3,
): InsightCard[] {
  const matched: InsightCard[] = [];
  const sorted = [...templates].sort((a, b) => a.priority - b.priority);

  for (const tmpl of sorted) {
    if (matched.length >= max) break;
    if (tmpl.match(filters, data, view)) {
      matched.push(tmpl.generate(filters, data));
    }
  }

  return matched;
}
