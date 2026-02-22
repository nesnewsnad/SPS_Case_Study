import { describe, it, expect } from 'vitest';
import { generateInsights } from '@/lib/generate-insights';
import type { FilterState } from '@/contexts/filter-context';
import type { OverviewResponse, ClaimsResponse } from '@/lib/api-types';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const baseKpis = {
  totalClaims: 55000,
  netClaims: 50000,
  reversalRate: 10.8,
  uniqueDrugs: 1200,
};

const mockOverviewData: OverviewResponse = {
  kpis: baseKpis,
  unfilteredKpis: baseKpis,
  monthly: [
    { month: '2021-01', incurred: 5000, reversed: 500 },
    { month: '2021-02', incurred: 4800, reversed: 480 },
    { month: '2021-03', incurred: 5100, reversed: 510 },
    { month: '2021-04', incurred: 4900, reversed: 490 },
    { month: '2021-05', incurred: 3, reversed: 2 },
    { month: '2021-06', incurred: 5000, reversed: 500 },
    { month: '2021-07', incurred: 5050, reversed: 505 },
    { month: '2021-08', incurred: 4700, reversed: 470 },
    { month: '2021-09', incurred: 7100, reversed: 710 },
    { month: '2021-10', incurred: 5200, reversed: 520 },
    { month: '2021-11', incurred: 2300, reversed: 230 },
    { month: '2021-12', incurred: 5000, reversed: 500 },
  ],
  formulary: [
    { type: 'OPEN', netClaims: 25000, reversalRate: 10.8 },
    { type: 'MANAGED', netClaims: 18000, reversalRate: 10.7 },
    { type: 'HMF', netClaims: 7000, reversalRate: 10.7 },
  ],
  states: [
    { state: 'CA', netClaims: 15000, totalClaims: 16800, reversalRate: 10.0, groupCount: 40 },
    { state: 'IN', netClaims: 12000, totalClaims: 13400, reversalRate: 10.0, groupCount: 35 },
    { state: 'KS', netClaims: 8000, totalClaims: 8900, reversalRate: 10.0, groupCount: 30 },
    { state: 'MN', netClaims: 9000, totalClaims: 10000, reversalRate: 10.0, groupCount: 44 },
    { state: 'PA', netClaims: 6000, totalClaims: 6700, reversalRate: 10.2, groupCount: 40 },
  ],
  allStates: [
    { state: 'CA', netClaims: 15000, totalClaims: 16800, reversalRate: 10.0, groupCount: 40 },
    { state: 'IN', netClaims: 12000, totalClaims: 13400, reversalRate: 10.0, groupCount: 35 },
    { state: 'KS', netClaims: 8000, totalClaims: 8900, reversalRate: 10.0, groupCount: 30 },
    { state: 'MN', netClaims: 9000, totalClaims: 10000, reversalRate: 10.0, groupCount: 44 },
    { state: 'PA', netClaims: 6000, totalClaims: 6700, reversalRate: 10.2, groupCount: 40 },
  ],
  adjudication: { adjudicated: 12500, notAdjudicated: 37500, rate: 25.0 },
};

const mockClaimsData: ClaimsResponse = {
  kpis: baseKpis,
  unfilteredKpis: baseKpis,
  monthly: mockOverviewData.monthly,
  drugs: [
    {
      drugName: 'ATORVASTATIN',
      labelName: 'Atorvastatin 40mg',
      ndc: '111',
      netClaims: 10000,
      reversalRate: 10.5,
      formulary: 'OPEN',
      topState: 'CA',
    },
    {
      drugName: 'PANTOPRAZOLE',
      labelName: 'Pantoprazole 40mg',
      ndc: '222',
      netClaims: 9000,
      reversalRate: 9.8,
      formulary: 'MANAGED',
      topState: 'IN',
    },
    {
      drugName: 'TAMSULOSIN',
      labelName: 'Tamsulosin 0.4mg',
      ndc: '333',
      netClaims: 8500,
      reversalRate: 11.2,
      formulary: 'OPEN',
      topState: 'MN',
    },
  ],
  daysSupply: [
    { bin: '7', count: 7300 },
    { bin: '14', count: 10400 },
    { bin: '30', count: 3600 },
    { bin: '60', count: 2400 },
    { bin: '90', count: 300 },
  ],
  mony: [
    { type: 'Y', netClaims: 42000 },
    { type: 'N', netClaims: 6800 },
    { type: 'O', netClaims: 750 },
    { type: 'M', netClaims: 450 },
  ],
  topGroups: [
    { groupId: '6P6002', netClaims: 17000 },
    { groupId: '101320', netClaims: 14000 },
    { groupId: '400127', netClaims: 13000 },
  ],
  topManufacturers: [
    { manufacturer: 'AUROBINDO', netClaims: 43000 },
    { manufacturer: 'ASCEND', netClaims: 35000 },
    { manufacturer: 'AMNEAL', netClaims: 34000 },
  ],
};

const emptyFilters: FilterState = {
  entityId: 1,
  includeFlaggedNdcs: false,
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('generateInsights', () => {
  // --- Overview: unfiltered ---
  describe('unfiltered overview', () => {
    it('returns portfolio-summary, distribution-channel, ltc-pattern', () => {
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview');
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.id)).toEqual([
        'portfolio-summary',
        'distribution-channel',
        'ltc-pattern',
      ]);
    });

    it('portfolio-summary contains net claims count and state count', () => {
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview');
      const ps = results.find((r) => r.id === 'portfolio-summary')!;
      expect(ps.severity).toBe('info');
      expect(ps.body).toContain('5 states');
      expect(ps.body).toContain('3 formulary types');
    });
  });

  // --- Overview: state filters ---
  describe('state filter (KS)', () => {
    it('returns KS batch reversal warning as highest-priority insight', () => {
      const filters: FilterState = { ...emptyFilters, state: 'KS' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      expect(results[0].id).toBe('ltc-pattern');
      expect(results[1].id).toBe('state-ks-warning');
      expect(results[1].severity).toBe('warning');
      expect(results[1].body).toContain('18 Kansas groups');
    });
  });

  describe('state filter (CA)', () => {
    it('returns state-rank with correct ordinal and share', () => {
      const filters: FilterState = { ...emptyFilters, state: 'CA' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const rank = results.find((r) => r.id === 'state-rank')!;
      expect(rank.title).toContain('California');
      expect(rank.title).toContain('1st');
      expect(rank.body).toContain('30.0%');
    });

    it('returns correct rank for 2nd place state', () => {
      const filters: FilterState = { ...emptyFilters, state: 'IN' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const rank = results.find((r) => r.id === 'state-rank')!;
      expect(rank.title).toContain('Indiana');
      expect(rank.title).toContain('2nd');
    });

    it('returns correct rank for 3rd place state', () => {
      const filters: FilterState = { ...emptyFilters, state: 'MN' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const rank = results.find((r) => r.id === 'state-rank')!;
      expect(rank.title).toContain('3rd');
    });

    it('returns "4th" for 4th place state', () => {
      const filters: FilterState = { ...emptyFilters, state: 'KS' };
      const results = generateInsights(filters, mockOverviewData, 'overview', 5);
      const rank = results.find((r) => r.id === 'state-rank')!;
      expect(rank.title).toContain('4th');
    });
  });

  // --- Overview: month filters ---
  describe('month filter (September)', () => {
    it('returns September Surge warning', () => {
      const filters: FilterState = { ...emptyFilters, dateStart: '2021-09-01' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const sep = results.find((r) => r.id === 'month-sep')!;
      expect(sep.severity).toBe('warning');
      expect(sep.title).toContain('September Surge');
    });
  });

  describe('month filter (November)', () => {
    it('returns November Dip warning', () => {
      const filters: FilterState = { ...emptyFilters, dateStart: '2021-11-01' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const nov = results.find((r) => r.id === 'month-nov')!;
      expect(nov.severity).toBe('warning');
      expect(nov.title).toContain('November Dip');
    });
  });

  describe('month filter (May)', () => {
    it('returns Synthetic Data Alert', () => {
      const filters: FilterState = { ...emptyFilters, dateStart: '2021-05-01' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const may = results.find((r) => r.id === 'month-may')!;
      expect(may.severity).toBe('warning');
      expect(may.title).toContain('Synthetic Data Alert');
    });
  });

  // --- Overview: formulary filter ---
  describe('formulary filter', () => {
    it('returns formulary-active insight', () => {
      const filters: FilterState = { ...emptyFilters, formulary: 'OPEN' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const f = results.find((r) => r.id === 'formulary-active')!;
      expect(f.severity).toBe('info');
      expect(f.body).toContain('OPEN formulary');
      expect(f.body).toContain('25,000');
    });
  });

  // --- Overview: MONY Y filter ---
  describe('MONY Y filter (overview)', () => {
    it('returns generic single-source positive', () => {
      const filters: FilterState = { ...emptyFilters, mony: 'Y' };
      const results = generateInsights(filters, mockOverviewData, 'overview');
      const my = results.find((r) => r.id === 'mony-y')!;
      expect(my.severity).toBe('positive');
      expect(my.title).toContain('Generic Single-Source');
    });
  });

  // --- Explorer: unfiltered ---
  describe('unfiltered explorer', () => {
    it('returns generic-mix, supply-cycles, top-drug-profile', () => {
      const results = generateInsights(emptyFilters, mockClaimsData, 'explorer');
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.id)).toEqual([
        'exp-generic-mix',
        'exp-supply-cycles',
        'exp-top-drug-profile',
      ]);
    });

    it('generic-mix computes correct percentage', () => {
      const results = generateInsights(emptyFilters, mockClaimsData, 'explorer');
      const gm = results.find((r) => r.id === 'exp-generic-mix')!;
      expect(gm.severity).toBe('positive');
      // Y(42000) + O(750) = 42750, total = 50000, = 86%
      expect(gm.body).toContain('86%');
    });

    it('supply-cycles computes short-cycle percentage', () => {
      const results = generateInsights(emptyFilters, mockClaimsData, 'explorer');
      const sc = results.find((r) => r.id === 'exp-supply-cycles')!;
      // 7(7300) + 14(10400) = 17700 / 24000 total = 74%
      expect(sc.body).toContain('74%');
    });

    it('top-drug-profile references the first drug', () => {
      const results = generateInsights(emptyFilters, mockClaimsData, 'explorer');
      const td = results.find((r) => r.id === 'exp-top-drug-profile')!;
      expect(td.body).toContain('ATORVASTATIN');
      expect(td.body).toContain('10,000');
    });
  });

  // --- Explorer: drug filter ---
  describe('explorer drug filter', () => {
    it('returns drug-detail with info severity for normal reversal rate', () => {
      const filters: FilterState = { ...emptyFilters, drug: 'ATORVASTATIN' };
      const results = generateInsights(filters, mockClaimsData, 'explorer');
      const dd = results.find((r) => r.id === 'exp-drug-detail')!;
      expect(dd.severity).toBe('info');
      expect(dd.body).not.toContain('Elevated reversal rate');
    });

    it('returns drug-detail with warning severity when reversal > 15%', () => {
      const highRevData: ClaimsResponse = {
        ...mockClaimsData,
        drugs: [
          {
            drugName: 'HIGHRISK',
            labelName: 'HighRisk 50mg',
            ndc: '999',
            netClaims: 5000,
            reversalRate: 18.5,
            formulary: 'MANAGED',
            topState: 'PA',
          },
        ],
      };
      const filters: FilterState = { ...emptyFilters, drug: 'HIGHRISK' };
      const results = generateInsights(filters, highRevData, 'explorer');
      const dd = results.find((r) => r.id === 'exp-drug-detail')!;
      expect(dd.severity).toBe('warning');
      expect(dd.body).toContain('Elevated reversal rate');
    });
  });

  // --- Explorer: group filter ---
  describe('explorer group filter', () => {
    it('returns group-detail with correct severity based on reversal rate', () => {
      const filters: FilterState = { ...emptyFilters, groupId: '6P6002' };
      const results = generateInsights(filters, mockClaimsData, 'explorer');
      const gd = results.find((r) => r.id === 'exp-group-detail')!;
      // kpis.reversalRate = 10.8, which is <= 15, so info
      expect(gd.severity).toBe('info');
      expect(gd.body).toContain('Group 6P6002');
    });

    it('returns warning when group reversal rate > 15%', () => {
      const highRevKpis = { ...baseKpis, reversalRate: 17.3 };
      const highRevData: ClaimsResponse = { ...mockClaimsData, kpis: highRevKpis };
      const filters: FilterState = { ...emptyFilters, groupId: '400127' };
      const results = generateInsights(filters, highRevData, 'explorer');
      const gd = results.find((r) => r.id === 'exp-group-detail')!;
      expect(gd.severity).toBe('warning');
    });
  });

  // --- Max cap ---
  describe('max cap', () => {
    it('returns at most 3 by default', () => {
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview');
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('returns at most max=1', () => {
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview', 1);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('portfolio-summary');
    });

    it('returns more when max is raised', () => {
      const filters: FilterState = { ...emptyFilters, state: 'KS' };
      const results = generateInsights(filters, mockOverviewData, 'overview', 10);
      expect(results.length).toBeGreaterThan(3);
    });
  });

  // --- Priority ordering ---
  describe('priority ordering', () => {
    it('lower priority number appears first', () => {
      // portfolio-summary (10) should come before distribution-channel (11)
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview', 10);
      const ids = results.map((r) => r.id);
      expect(ids.indexOf('portfolio-summary')).toBeLessThan(ids.indexOf('distribution-channel'));
      expect(ids.indexOf('distribution-channel')).toBeLessThan(ids.indexOf('ltc-pattern'));
    });

    it('month warnings appear before state-rank', () => {
      const filters: FilterState = { ...emptyFilters, state: 'CA', dateStart: '2021-09-01' };
      const results = generateInsights(filters, mockOverviewData, 'overview', 10);
      const ids = results.map((r) => r.id);
      expect(ids.indexOf('month-sep')).toBeLessThan(ids.indexOf('state-rank'));
    });
  });

  // --- View isolation ---
  describe('view isolation', () => {
    it('overview templates do not appear in explorer view', () => {
      const results = generateInsights(emptyFilters, mockClaimsData, 'explorer', 10);
      const ids = results.map((r) => r.id);
      expect(ids).not.toContain('portfolio-summary');
      expect(ids).not.toContain('distribution-channel');
    });

    it('explorer templates do not appear in overview view', () => {
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview', 10);
      const ids = results.map((r) => r.id);
      expect(ids).not.toContain('exp-generic-mix');
      expect(ids).not.toContain('exp-supply-cycles');
    });
  });

  // --- InsightCard shape ---
  describe('InsightCard structure', () => {
    it('every card has id, severity, title, body', () => {
      const results = generateInsights(emptyFilters, mockOverviewData, 'overview');
      for (const card of results) {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('severity');
        expect(card).toHaveProperty('title');
        expect(card).toHaveProperty('body');
        expect(['info', 'warning', 'positive']).toContain(card.severity);
      }
    });
  });
});
