const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

const MONTH_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** 531988 → "531,988" */
export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

/** 10.81 → "10.8%" (API returns rates as 0-100) */
export function formatPercent(n: number): string {
  return `${n.toFixed(1)}%`;
}

/** 531988 → "532K", 1234567 → "1.2M" */
export function abbreviateNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

/** "2021-01" → "Jan" */
export function formatMonthLabel(yearMonth: string): string {
  const month = parseInt(yearMonth.split('-')[1], 10);
  return MONTH_LABELS[month - 1] ?? yearMonth;
}

/** "2021-01" → "January 2021" */
export function formatMonthFull(yearMonth: string): string {
  const [year, m] = yearMonth.split('-');
  const month = parseInt(m, 10);
  return `${MONTH_FULL[month - 1] ?? m} ${year}`;
}

/** Fill missing months with zeros so charts always show all 12 months */
export function fillAllMonths(
  data: { month: string; incurred: number; reversed: number }[],
  year = '2021',
): { month: string; incurred: number; reversed: number }[] {
  const byMonth = new Map(data.map((d) => [d.month, d]));
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, '0')}`;
    return byMonth.get(month) ?? { month, incurred: 0, reversed: 0 };
  });
}

/** Smart axis tick: 53000→"53K", 800→"800", 1200000→"1.2M" */
export function formatAxisTick(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(v / 1_000)}K`;
  return v.toString();
}

/** "2021-09" → "2021-09-30" */
export function getLastDayOfMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
}
