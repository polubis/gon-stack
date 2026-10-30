import { localDay, localMonth } from '@/shared/date/date';
import {
  categoryShares,
  type CategorizedItem,
} from '@/shared/expense-category/category';
import {
  bucketOf,
  containsDate,
  daysBetween,
  periodDays,
  periodMonths,
  type Period,
} from '@/shared/period/period';

export type DashboardExpense = {
  date: string;
  amount: number;
  /** `null` for an expense made of products from different categories. */
  categoryId: string | null;
  items?: CategorizedItem[];
};
export type DashboardCategory = { id: string; name: string; color: string };

export type DashboardCategorySlice = {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type DashboardPoint = {
  /** 1-based bucket: a day of the period, or a month of a year. */
  index: number;
  total: number;
};

export type DashboardSummary = {
  /** Selected period total. */
  total: number;
  /** Selected period vs the previous one, in percent. */
  change: number;
  previousTotal: number;
  /** Number of expenses in the selected period. */
  transactions: number;
  /** Selected period total per elapsed day. */
  dailyAverage: number;
  /** Per-bucket totals of the selected period, first bucket first. */
  series: DashboardPoint[];
  /** Per-bucket totals of the previous period, first bucket first. */
  previousSeries: DashboardPoint[];
  /** Total monthly limit, `null` when none is set. */
  monthlyLimit: number | null;
  /** Category breakdown of the selected period. */
  categories: DashboardCategorySlice[];
};

const sum = (expenses: DashboardExpense[]): number =>
  expenses.reduce((total, e) => total + e.amount, 0);

const inPeriod = (
  expenses: DashboardExpense[],
  period: Period,
  timeZone?: string,
): DashboardExpense[] =>
  expenses.filter((e) => containsDate(period, e.date, timeZone));

const bucketIndex = (
  period: Period,
  date: string,
  timeZone?: string,
): number =>
  bucketOf(period) === 'month'
    ? periodMonths(period).indexOf(localMonth(date, timeZone)) + 1
    : daysBetween(period.from, localDay(date, timeZone)) + 1;

/** Buckets (days or months) the chart of `period` shows. */
export const seriesLength = (period: Period): number =>
  bucketOf(period) === 'month'
    ? periodMonths(period).length
    : periodDays(period);

const seriesOf = (
  expenses: DashboardExpense[],
  period: Period,
  timeZone?: string,
): DashboardPoint[] => {
  const scoped = inPeriod(expenses, period, timeZone);
  const length = seriesLength(period);
  // One pass: each expense lands in its bucket once, not once per bucket.
  const totals = Array.from({ length }, () => 0);
  for (const e of scoped) {
    const i = bucketIndex(period, e.date, timeZone) - 1;
    if (i >= 0 && i < length) totals[i] = (totals[i] ?? 0) + e.amount;
  }
  return totals.map((total, i) => ({ index: i + 1, total }));
};

/** Days of `period` that have passed as of `today` (`YYYY-MM-DD`). */
const elapsedDays = (period: Period, today: string): number => {
  if (today < period.from) return 0;
  const last = today < period.to ? today : period.to;
  return daysBetween(period.from, last) + 1;
};

/** Sums of the selected period and the one before it, however they were found. */
export type DashboardTotals = {
  total: number;
  previousTotal: number;
  transactions: number;
  /** Buckets with something in them; the others are zero. */
  series: DashboardPoint[];
  previousSeries: DashboardPoint[];
  /** What each category got of the selected period (no order, no zeros needed). */
  categoryAmounts: { categoryId: string; amount: number }[];
};

const fill = (length: number, points: DashboardPoint[]): DashboardPoint[] => {
  const totals = new Map(points.map((p) => [p.index, p.total]));
  return Array.from({ length }, (_, i) => ({
    index: i + 1,
    total: totals.get(i + 1) ?? 0,
  }));
};

/** The dashboard rules on top of sums: change, average, shares, order. */
export const dashboardFromTotals = ({
  totals,
  categories,
  period,
  previous,
  today,
  monthlyLimit,
}: {
  totals: DashboardTotals;
  categories: DashboardCategory[];
  period: Period;
  previous: Period;
  /** `YYYY-MM-DD`; injected so the summary stays pure. */
  today: string;
  monthlyLimit: number | null;
}): DashboardSummary => {
  const { total, previousTotal } = totals;
  const change =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;

  const elapsed = elapsedDays(period, today);
  const dailyAverage = elapsed === 0 ? 0 : total / elapsed;

  const categorySlices = categories
    .map((category) => {
      const amount = Number(
        totals.categoryAmounts
          .filter((s) => s.categoryId === category.id)
          .reduce((sum, s) => sum + s.amount, 0)
          .toFixed(2),
      );
      return {
        categoryId: category.id,
        name: category.name,
        color: category.color,
        amount,
        pct: total === 0 ? 0 : (amount / total) * 100,
      };
    })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    total,
    change,
    previousTotal,
    transactions: totals.transactions,
    dailyAverage,
    series: fill(seriesLength(period), totals.series),
    previousSeries: fill(seriesLength(previous), totals.previousSeries),
    monthlyLimit,
    categories: categorySlices,
  };
};

export const summarizeDashboard = ({
  expenses,
  categories,
  period,
  previous,
  today,
  monthlyLimit,
  timeZone,
}: {
  expenses: DashboardExpense[];
  categories: DashboardCategory[];
  period: Period;
  /** The period right before `period`, to compare with. */
  previous: Period;
  /** `YYYY-MM-DD`; injected so the summary stays pure. */
  today: string;
  monthlyLimit: number | null;
  /** IANA zone whose calendar days the expenses fall on (default: server). */
  timeZone?: string;
}): DashboardSummary => {
  const scoped = inPeriod(expenses, period, timeZone);

  return dashboardFromTotals({
    totals: {
      total: sum(scoped),
      previousTotal: sum(inPeriod(expenses, previous, timeZone)),
      transactions: scoped.length,
      series: seriesOf(expenses, period, timeZone),
      previousSeries: seriesOf(expenses, previous, timeZone),
      categoryAmounts: scoped.flatMap((e) =>
        categoryShares({ ...e, items: e.items ?? [] }),
      ),
    },
    categories,
    period,
    previous,
    today,
    monthlyLimit,
  });
};
