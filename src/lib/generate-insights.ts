import type { FilterState } from '@/contexts/filter-context';
import type { OverviewResponse, ClaimsResponse } from '@/lib/api-types';
import { formatNumber, formatPercent, abbreviateNumber } from '@/lib/format';

export interface InsightCard {
  id: string;
  severity: 'info' | 'warning' | 'positive';
  title: string;
  body: string;
}

type InsightData = OverviewResponse | ClaimsResponse;

interface InsightTemplate {
  id: string;
  priority: number; // lower = higher priority
  match: (filters: FilterState, data: InsightData, view: string) => boolean;
  generate: (filters: FilterState, data: InsightData) => InsightCard;
}

// Type guard helpers — safe access to view-specific fields
function asOverview(d: InsightData): OverviewResponse {
  return d as OverviewResponse;
}
function asClaims(d: InsightData): ClaimsResponse {
  return d as ClaimsResponse;
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
  // ═══════════════════════════════════════════════════════════════════════
  // OVERVIEW TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════

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
      body: `${abbreviateNumber(d.kpis.netClaims)} net claims across ${asOverview(d).allStates.length} states and ${asOverview(d).formulary.length} formulary types. Overall reversal rate: ${formatPercent(d.kpis.reversalRate)}.`,
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
      body: 'Day-1-of-month volume is ~7× the daily average — a strong indicator of long-term care batch dispensing. Days supply clusters at 7 and 14 days.',
    }),
  },

  // --- Per-state: KS batch reversal warning (highest priority) ---
  {
    id: 'state-ks-warning',
    priority: 19,
    match: (f, _d, v) => v === 'overview' && f.state === 'KS',
    generate: () => ({
      id: 'state-ks-warning',
      severity: 'warning',
      title: 'August Batch Reversal',
      body: '18 Kansas groups (400xxx prefix) had 100% reversal in August — a batch reversal event. Claims were re-submitted in September at ~1.4× normal volume. Excluding August, KS reversal rate is ~10%, matching other states.',
    }),
  },

  // --- Per-state: rank + share (any state, Overview) ---
  {
    id: 'state-rank',
    priority: 20,
    match: (f, _d, v) => v === 'overview' && !!f.state,
    generate: (f, d) => {
      const sorted = [...asOverview(d).allStates].sort((a, b) => b.netClaims - a.netClaims);
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

  // --- Per-state: group density (Overview) ---
  {
    id: 'state-groups',
    priority: 21,
    match: (f, d, v) =>
      v === 'overview' &&
      !!f.state &&
      asOverview(d).allStates.some((s) => s.state === f.state && s.groupCount > 0),
    generate: (f, d) => {
      const stateData = asOverview(d).allStates.find((s) => s.state === f.state);
      const groups = stateData?.groupCount ?? 0;
      const net = stateData?.netClaims ?? 0;
      const avg = groups > 0 ? Math.round(net / groups) : 0;
      const totalGroups = asOverview(d).allStates.reduce((sum, s) => sum + s.groupCount, 0);
      return {
        id: 'state-groups',
        severity: 'info',
        title: `${groups} Groups`,
        body: `${f.state} has ${groups} of ${totalGroups} total groups, averaging ${formatNumber(avg)} claims per group. All groups are state-specific — no group spans multiple states.`,
      };
    },
  },

  // --- Per-month insights (both views — d.monthly exists on both) ---
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

  // --- Per-formulary (Overview only) ---
  {
    id: 'formulary-active',
    priority: 25,
    match: (f, _d, v) => v === 'overview' && !!f.formulary,
    generate: (f, d) => {
      const match = asOverview(d).formulary.find((x) => x.type === f.formulary);
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

  // --- Per-MONY (Overview) ---
  {
    id: 'mony-y',
    priority: 24,
    match: (f, _d, v) => v === 'overview' && f.mony === 'Y',
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
    match: (f, _d, v) => v === 'overview' && f.mony === 'N',
    generate: (_f, d) => ({
      id: 'mony-n',
      severity: 'info',
      title: 'Brand Single-Source (N)',
      body: `Single-source brands account for ${formatNumber(d.kpis.netClaims)} net claims in this view. These are typically specialty or patented drugs without generic alternatives — important for cost containment strategy.`,
    }),
  },

  // --- Multi-filter (Overview) ---
  {
    id: 'state-formulary-combo',
    priority: 30,
    match: (f, _d, v) => v === 'overview' && !!f.state && !!f.formulary,
    generate: (f, d) => ({
      id: 'state-formulary-combo',
      severity: 'info',
      title: `${f.state} × ${f.formulary}`,
      body: `Viewing ${f.state} claims under ${f.formulary} formulary: ${formatNumber(d.kpis.netClaims)} net claims, ${formatPercent(d.kpis.reversalRate)} reversal rate.`,
    }),
  },
  {
    id: 'group-filter',
    priority: 28,
    match: (f, _d, v) => v === 'overview' && !!f.groupId,
    generate: (f, d) => ({
      id: 'group-filter',
      severity: 'info',
      title: `Group ${f.groupId}`,
      body: `Group ${f.groupId}: ${formatNumber(d.kpis.netClaims)} net claims, ${formatPercent(d.kpis.reversalRate)} reversal rate. All groups are state-specific — no group spans multiple states.`,
    }),
  },

  // ═══════════════════════════════════════════════════════════════════════
  // EXPLORER TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════

  // --- Unfiltered Explorer insights ---
  {
    id: 'exp-generic-mix',
    priority: 10,
    match: (f, _d, v) =>
      v === 'explorer' && !f.mony && !f.drug && !f.manufacturer && !f.groupId && !f.state,
    generate: (_f, d) => {
      const cd = asClaims(d);
      const genY = cd.mony.find((m) => m.type === 'Y');
      const genO = cd.mony.find((m) => m.type === 'O');
      const total = cd.mony.reduce((s, m) => s + m.netClaims, 0);
      const genericPct =
        total > 0
          ? ((((genY?.netClaims ?? 0) + (genO?.netClaims ?? 0)) / total) * 100).toFixed(0)
          : '0';
      return {
        id: 'exp-generic-mix',
        severity: 'positive',
        title: 'Heavy Generic Utilization',
        body: `Generics (MONY Y+O) account for ~${genericPct}% of claims — consistent with aggressive LTC formulary management and generic utilization targets.`,
      };
    },
  },
  {
    id: 'exp-supply-cycles',
    priority: 11,
    match: (f, _d, v) => v === 'explorer' && !f.drug && !f.manufacturer && !f.groupId,
    generate: (_f, d) => {
      const cd = asClaims(d);
      const totalCount = cd.daysSupply.reduce((s, b) => s + b.count, 0);
      const short = cd.daysSupply
        .filter((b) => {
          const n = parseInt(b.bin);
          return !isNaN(n) && n <= 14;
        })
        .reduce((s, b) => s + b.count, 0);
      const shortPct = totalCount > 0 ? ((short / totalCount) * 100).toFixed(0) : '0';
      return {
        id: 'exp-supply-cycles',
        severity: 'info',
        title: 'Short-Cycle Dispensing',
        body: `${shortPct}% of fills are 14 days or fewer, reflecting LTC dispensing cycles where medications are reviewed and adjusted frequently. This is typical for skilled nursing and long-term care facilities.`,
      };
    },
  },
  {
    id: 'exp-top-drug-profile',
    priority: 12,
    match: (f, _d, v) => v === 'explorer' && !f.drug && !f.manufacturer && !f.groupId,
    generate: (_f, d) => {
      const cd = asClaims(d);
      if (cd.drugs.length === 0)
        return {
          id: 'exp-top-drug-profile',
          severity: 'info' as const,
          title: 'No Drugs',
          body: 'No drugs match the current filters.',
        };
      const top = cd.drugs[0];
      return {
        id: 'exp-top-drug-profile',
        severity: 'info',
        title: 'Top Drug Profile',
        body: `${top.drugName} leads with ${formatNumber(top.netClaims)} net claims (${formatPercent(top.reversalRate)} reversal rate). The top drug mix spans statins, GI medications, pain management, and anticoagulants — consistent with an elderly LTC population.`,
      };
    },
  },

  // --- Per-drug (Explorer) ---
  {
    id: 'exp-drug-detail',
    priority: 18,
    match: (f, _d, v) => v === 'explorer' && !!f.drug,
    generate: (f, d) => {
      const cd = asClaims(d);
      const drug = cd.drugs.find((dr) => dr.drugName === f.drug);
      if (!drug)
        return {
          id: 'exp-drug-detail',
          severity: 'info' as const,
          title: `${f.drug}`,
          body: `Viewing claims for ${f.drug}.`,
        };
      const severity = drug.reversalRate > 15 ? ('warning' as const) : ('info' as const);
      return {
        id: 'exp-drug-detail',
        severity,
        title: drug.drugName,
        body: `${drug.drugName} accounts for ${formatNumber(drug.netClaims)} net claims with a ${formatPercent(drug.reversalRate)} reversal rate. Primarily dispensed under ${drug.formulary} formulary in ${drug.topState}.${drug.reversalRate > 15 ? ' Elevated reversal rate warrants review.' : ''}`,
      };
    },
  },

  // --- Per-manufacturer (Explorer) ---
  {
    id: 'exp-manufacturer-detail',
    priority: 20,
    match: (f, _d, v) => v === 'explorer' && !!f.manufacturer,
    generate: (f, d) => {
      const cd = asClaims(d);
      const mfr = cd.topManufacturers.find((m) => m.manufacturer === f.manufacturer);
      const drugCount = cd.drugs.length;
      return {
        id: 'exp-manufacturer-detail',
        severity: 'info',
        title: f.manufacturer ?? 'Manufacturer',
        body: mfr
          ? `${f.manufacturer} supplies ${drugCount} drug${drugCount !== 1 ? 's' : ''} representing ${formatNumber(mfr.netClaims)} net claims. Top generic manufacturers (Aurobindo, Ascend, Amneal, Apotex) dominate volume in this LTC portfolio.`
          : `${f.manufacturer} supplies ${drugCount} drug${drugCount !== 1 ? 's' : ''} in the current view. ${formatNumber(d.kpis.netClaims)} total net claims.`,
      };
    },
  },

  // --- Per-MONY (Explorer) ---
  {
    id: 'exp-mony-y',
    priority: 22,
    match: (f, _d, v) => v === 'explorer' && f.mony === 'Y',
    generate: (_f, d) => ({
      id: 'exp-mony-y',
      severity: 'positive',
      title: 'Single-Source Generics (Y)',
      body: `Single-source generics represent the largest category at ${formatNumber(d.kpis.netClaims)} net claims — the dominant drug type, consistent with LTC generic-first dispensing. These are the most cost-effective options available.`,
    }),
  },
  {
    id: 'exp-mony-n',
    priority: 22,
    match: (f, _d, v) => v === 'explorer' && f.mony === 'N',
    generate: (_f, d) => {
      const cd = asClaims(d);
      const topBrand = cd.drugs.length > 0 ? cd.drugs[0].drugName : 'N/A';
      return {
        id: 'exp-mony-n',
        severity: 'info',
        title: 'Single-Source Brands (N)',
        body: `Single-source brands account for ${formatNumber(d.kpis.netClaims)} net claims — drugs with no generic alternative, typically carrying higher costs. ${topBrand} is the top brand by volume in this view.`,
      };
    },
  },
  {
    id: 'exp-mony-o',
    priority: 22,
    match: (f, _d, v) => v === 'explorer' && f.mony === 'O',
    generate: (_f, d) => ({
      id: 'exp-mony-o',
      severity: 'info',
      title: 'Multi-Source Generics (O)',
      body: `Multi-source generics show ${formatNumber(d.kpis.netClaims)} net claims. These drugs have multiple generic manufacturers competing, often driving the lowest per-unit costs.`,
    }),
  },
  {
    id: 'exp-mony-m',
    priority: 22,
    match: (f, _d, v) => v === 'explorer' && f.mony === 'M',
    generate: (_f, d) => ({
      id: 'exp-mony-m',
      severity: 'info',
      title: 'Multi-Source Brands (M)',
      body: `Multi-source brands represent ${formatNumber(d.kpis.netClaims)} net claims — brand-name drugs where generic alternatives exist. Formulary optimization could shift these to lower-cost generics.`,
    }),
  },

  // --- Per-group (Explorer) ---
  {
    id: 'exp-group-detail',
    priority: 25,
    match: (f, _d, v) => v === 'explorer' && !!f.groupId,
    generate: (f, d) => {
      const severity = d.kpis.reversalRate > 15 ? ('warning' as const) : ('info' as const);
      return {
        id: 'exp-group-detail',
        severity,
        title: `Group ${f.groupId}`,
        body: `Group ${f.groupId}: ${formatNumber(d.kpis.netClaims)} net claims across ${formatNumber(d.kpis.uniqueDrugs)} unique drugs. Reversal rate is ${formatPercent(d.kpis.reversalRate)}, ${d.kpis.reversalRate > 12 ? 'above' : d.kpis.reversalRate < 9 ? 'below' : 'in line with'} the 10.8% overall average. Note: all groups are state-specific.`,
      };
    },
  },

  // --- Per-state (Explorer) ---
  {
    id: 'exp-state-detail',
    priority: 24,
    match: (f, _d, v) => v === 'explorer' && !!f.state && !f.groupId && !f.drug,
    generate: (f, d) => {
      const cd = asClaims(d);
      const groupCount = cd.topGroups.length;
      const drugCount = d.kpis.uniqueDrugs;
      return {
        id: 'exp-state-detail',
        severity: f.state === 'KS' ? ('warning' as const) : ('info' as const),
        title: `${f.state} Explorer`,
        body: `${f.state} accounts for ${formatNumber(d.kpis.netClaims)} net claims with ${formatNumber(drugCount)} unique drugs across ${groupCount}+ groups.${f.state === 'KS' ? ' KS groups with "400xxx" prefix had a batch reversal event in August — see Anomalies page for details.' : ''}`,
      };
    },
  },

  // --- Combination insights (Explorer) ---
  {
    id: 'exp-state-mony-combo',
    priority: 28,
    match: (f, _d, v) => v === 'explorer' && !!f.state && !!f.mony,
    generate: (f, d) => ({
      id: 'exp-state-mony-combo',
      severity: 'info',
      title: `${f.state} × MONY ${f.mony}`,
      body: `Viewing ${f.state} claims for MONY type ${f.mony}: ${formatNumber(d.kpis.netClaims)} net claims, ${formatPercent(d.kpis.reversalRate)} reversal rate. MONY distribution remains consistent across states.`,
    }),
  },
  {
    id: 'exp-drug-state-combo',
    priority: 27,
    match: (f, _d, v) => v === 'explorer' && !!f.drug && !!f.state,
    generate: (f, d) => ({
      id: 'exp-drug-state-combo',
      severity: 'info',
      title: `${f.drug} in ${f.state}`,
      body: `${f.drug} in ${f.state}: ${formatNumber(d.kpis.netClaims)} net claims, ${formatPercent(d.kpis.reversalRate)} reversal rate.`,
    }),
  },

  // --- Explorer fallback ---
  {
    id: 'exp-fallback',
    priority: 100,
    match: (_f, _d, v) => v === 'explorer',
    generate: (_f, d) => ({
      id: 'exp-fallback',
      severity: 'info',
      title: 'Explorer View',
      body: `Showing ${formatNumber(d.kpis.netClaims)} net claims (${formatPercent(d.kpis.reversalRate)} reversal rate) across ${formatNumber(d.kpis.uniqueDrugs)} unique drugs for the current filter selection.`,
    }),
  },
];

/**
 * Generate up to `max` insight cards for the current filter + data state.
 * Priority-sorted — most specific match wins.
 */
export function generateInsights(
  filters: FilterState,
  data: InsightData,
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
