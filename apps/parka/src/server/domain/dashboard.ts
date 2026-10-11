import { localDay, localMonth } from '@/shared/date/date';
import {
  categoryShares,
  type CategorizedItem,
} from '@/shared/expense-category/category';
import {
  occurrencesInMonth,
  type RecurringOccurrence,
  type RecurringSource,
} from '@/shared/recurring/occurrences';
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

const seriesOf = (
  expenses: DashboardExpense[],
  period: Period,
  timeZone?: string,
): DashboardPoint[] => {
  const scoped = inPeriod(expenses, period, timeZone);
  const length =
    bucketOf(period) === 'month'
      ? periodMonths(period).length
      : periodDays(period);
  return Array.from({ length }, (_, i) => ({
    index: i + 1,
    total: sum(
      scoped.filter((e) => bucketIndex(period, e.date, timeZone) === i + 1),
    ),
  }));
};

/** Days of `period` that have passed as of `today` (`YYYY-MM-DD`). */
const elapsedDays = (period: Period, today: string): number => {
  if (today < period.from) return 0;
  const last = today < period.to ? today : period.to;
  return daysBetween(period.from, last) + 1;
};

/** Recurring charges that fall into any of `periods`; derived, never stored. */
export const chargesInPeriods = (
  schedule: RecurringSource[],
  periods: Period[],
): RecurringOccurrence[] => {
  const months = [...new Set(periods.flatMap(periodMonths))];
  return months
    .flatMap((month) => occurrencesInMonth(schedule, month))
    .filter((o) => periods.some((p) => containsDate(p, o.date)));
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
  const total = sum(scoped);
  const previousTotal = sum(inPeriod(expenses, previous, timeZone));
  const change =
    previousTotal === 0 ? 0 : ((total - previousTotal) / previousTotal) * 100;

  const elapsed = elapsedDays(period, today);
  const dailyAverage = elapsed === 0 ? 0 : total / elapsed;

  const shares = scoped.flatMap((e) =>
    categoryShares({ ...e, items: e.items ?? [] }),
  );
  const categorySlices = categories
    .map((category) => {
      const amount = Number(
        shares
          .filter((s) => s.categoryId === category.id)
          .reduce((total, s) => total + s.amount, 0)
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
    transactions: scoped.length,
    dailyAverage,
    series: seriesOf(expenses, period, timeZone),
    previousSeries: seriesOf(expenses, previous, timeZone),
    monthlyLimit,
    categories: categorySlices,
  };
};
