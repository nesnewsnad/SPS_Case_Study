import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPercent,
  abbreviateNumber,
  formatMonthLabel,
  formatMonthFull,
  fillAllMonths,
  formatAxisTick,
  getLastDayOfMonth,
} from '@/lib/format';

describe('formatNumber', () => {
  it('formats zero', () => {
    expect(formatNumber(0)).toBe('0');
  });

  it('adds commas to thousands', () => {
    expect(formatNumber(1234)).toBe('1,234');
  });

  it('formats large numbers', () => {
    expect(formatNumber(531988)).toBe('531,988');
  });

  it('handles negatives', () => {
    expect(formatNumber(-500)).toBe('-500');
  });
});

describe('formatPercent', () => {
  it('formats with one decimal', () => {
    expect(formatPercent(10.81)).toBe('10.8%');
  });

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('rounds correctly', () => {
    expect(formatPercent(99.95)).toBe('100.0%');
  });

  it('formats small decimals', () => {
    expect(formatPercent(0.04)).toBe('0.0%');
  });
});

describe('abbreviateNumber', () => {
  it('returns small numbers as-is', () => {
    expect(abbreviateNumber(999)).toBe('999');
  });

  it('abbreviates thousands', () => {
    expect(abbreviateNumber(1000)).toBe('1K');
  });

  it('rounds thousands', () => {
    expect(abbreviateNumber(53000)).toBe('53K');
  });

  it('rounds up near million boundary', () => {
    expect(abbreviateNumber(999999)).toBe('1000K');
  });

  it('abbreviates millions with one decimal', () => {
    expect(abbreviateNumber(1000000)).toBe('1.0M');
  });

  it('rounds millions correctly', () => {
    expect(abbreviateNumber(1234567)).toBe('1.2M');
  });

  it('handles negative thousands', () => {
    expect(abbreviateNumber(-5000)).toBe('-5K');
  });
});

describe('formatMonthLabel', () => {
  it('formats January', () => {
    expect(formatMonthLabel('2021-01')).toBe('Jan');
  });

  it('formats December', () => {
    expect(formatMonthLabel('2021-12')).toBe('Dec');
  });

  it('formats May', () => {
    expect(formatMonthLabel('2021-05')).toBe('May');
  });

  it('falls back on invalid input', () => {
    expect(formatMonthLabel('bad')).toBe('bad');
  });
});

describe('formatMonthFull', () => {
  it('formats January 2021', () => {
    expect(formatMonthFull('2021-01')).toBe('January 2021');
  });

  it('formats September 2021', () => {
    expect(formatMonthFull('2021-09')).toBe('September 2021');
  });
});

describe('fillAllMonths', () => {
  it('fills empty array with 12 zero entries', () => {
    const result = fillAllMonths([]);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ month: '2021-01', incurred: 0, reversed: 0 });
    expect(result[11]).toEqual({ month: '2021-12', incurred: 0, reversed: 0 });
  });

  it('fills gaps in sparse data', () => {
    const sparse = [
      { month: '2021-01', incurred: 100, reversed: 10 },
      { month: '2021-06', incurred: 200, reversed: 20 },
      { month: '2021-12', incurred: 300, reversed: 30 },
    ];
    const result = fillAllMonths(sparse);
    expect(result).toHaveLength(12);
    expect(result[0]).toEqual({ month: '2021-01', incurred: 100, reversed: 10 });
    expect(result[1]).toEqual({ month: '2021-02', incurred: 0, reversed: 0 });
    expect(result[5]).toEqual({ month: '2021-06', incurred: 200, reversed: 20 });
    expect(result[11]).toEqual({ month: '2021-12', incurred: 300, reversed: 30 });
  });

  it('passes through full 12-month data unchanged', () => {
    const full = Array.from({ length: 12 }, (_, i) => ({
      month: `2021-${String(i + 1).padStart(2, '0')}`,
      incurred: (i + 1) * 100,
      reversed: (i + 1) * 10,
    }));
    const result = fillAllMonths(full);
    expect(result).toEqual(full);
  });
});

describe('formatAxisTick', () => {
  it('returns small numbers as string', () => {
    expect(formatAxisTick(800)).toBe('800');
  });

  it('abbreviates thousands', () => {
    expect(formatAxisTick(53000)).toBe('53K');
  });

  it('abbreviates millions', () => {
    expect(formatAxisTick(1200000)).toBe('1.2M');
  });
});

describe('getLastDayOfMonth', () => {
  it('handles 31-day months', () => {
    expect(getLastDayOfMonth('2021-01')).toBe('2021-01-31');
  });

  it('handles February non-leap year', () => {
    expect(getLastDayOfMonth('2021-02')).toBe('2021-02-28');
  });

  it('handles 30-day months', () => {
    expect(getLastDayOfMonth('2021-04')).toBe('2021-04-30');
  });

  it('handles February leap year', () => {
    expect(getLastDayOfMonth('2024-02')).toBe('2024-02-29');
  });
});
