import type {
  Category,
  CategoryChange,
  CategorySlice,
  Expense,
  Month,
  TrendPoint,
} from '../domain/models';
import { monthOf, monthsEndingAt, prevMonth } from '../domain/format';

const sum = (expenses: Expense[]): number =>
  expenses.reduce((total, e) => total + e.amount, 0);

const inMonths = (expenses: Expense[], months: Month[]): Expense[] =>
  expenses.filter((e) => months.includes(monthOf(e.date)));

export const monthTotal = (expenses: Expense[], month: Month): number =>
  sum(inMonths(expenses, [month]));

export const changeVsPrevMonth = (
  expenses: Expense[],
  month: Month,
): number => {
  const previous = monthTotal(expenses, prevMonth(month));
  if (previous === 0) return 0;
  return ((monthTotal(expenses, month) - previous) / previous) * 100;
};

export const categoryBreakdown = (
  expenses: Expense[],
  categories: Category[],
  months: Month[],
): CategorySlice[] => {
  const scoped = inMonths(expenses, months);
  const total = sum(scoped);
  return categories
    .map((category) => {
      const amount = sum(scoped.filter((e) => e.categoryId === category.id));
      return {
        category,
        amount,
        pct: total === 0 ? 0 : (amount / total) * 100,
      };
    })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

export const trend = (
  expenses: Expense[],
  month: Month,
  count: number,
): TrendPoint[] =>
  monthsEndingAt(month, count).map((m) => ({
    month: m,
    total: monthTotal(expenses, m),
  }));

export const biggestChanges = (
  expenses: Expense[],
  categories: Category[],
  month: Month,
): CategoryChange[] => {
  const now = inMonths(expenses, [month]);
  const before = inMonths(expenses, [prevMonth(month)]);
  return categories
    .map((category) => {
      const current = sum(now.filter((e) => e.categoryId === category.id));
      const previous = sum(before.filter((e) => e.categoryId === category.id));
      const changePct =
        previous === 0
          ? current === 0
            ? 0
            : 100
          : ((current - previous) / previous) * 100;
      return { category, changePct };
    })
    .filter((c) => Math.abs(c.changePct) >= 1)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 5);
};
