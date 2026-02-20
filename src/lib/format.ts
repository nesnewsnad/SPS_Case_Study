const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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

/** "2021-09" → "2021-09-30" */
export function getLastDayOfMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
}
