import { categoryShares } from '@/shared/expense-category/category';
import { upcomingOccurrences } from '@/shared/recurring/occurrences';
import {
  MIXED_CATEGORY,
  UNCATEGORIZED,
  WARN_PCT,
} from '../configuration/constraints';
import { monthOf } from '../domain/format';
import { containsDate, limitForPeriod } from '@/shared/period/period';
import type {
  Category,
  CategoryId,
  CategoryLimit,
  CategoryProgress,
  Expense,
  ExpenseId,
  Limit,
  Month,
  Period,
  ProgressTone,
  Recurring,
  RecurringInterval,
  TotalProgress,
  Upcoming,
} from '../domain/models';

const UPCOMING_PREFIX = 'upcoming:';

/** How many rules the list announces at most, each by its next payment. */
export const UPCOMING_LIMIT = 3;

/**
 * The next payment of each rule after `today` (`YYYY-MM-DD`), nearest first.
 * One per rule: the same rule repeated would only duplicate what is on
 * screen. A projection: never stored, never part of a sum or a limit.
 */
export const upcomingCharges = (
  recurring: Recurring[],
  today: string,
): Upcoming[] =>
  recurring
    .flatMap((r) =>
      upcomingOccurrences(r, today, 1).map((date) => ({
        id: `${UPCOMING_PREFIX}${r.id}:${date}` as ExpenseId,
        recurring: r,
        date,
      })),
    )
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(0, UPCOMING_LIMIT);

/** Weekly / monthly / yearly in the app's language. */
export const intervalLabel = (interval: RecurringInterval): string => {
  switch (interval) {
    case 'weekly':
      return 'Co tydzień';
    case 'monthly':
      return 'Co miesiąc';
    case 'yearly':
      return 'Co rok';
    default: {
      const unreachable: never = interval;
      return unreachable;
    }
  }
};

export const sortByDateDesc = (list: Expense[]): Expense[] =>
  [...list].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

export const expensesInPeriod = (list: Expense[], period: Period): Expense[] =>
  sortByDateDesc(list.filter((e) => containsDate(period, e.date)));

export const expensesInMonth = (list: Expense[], month: Month): Expense[] =>
  sortByDateDesc(list.filter((e) => monthOf(e.date) === month));

/** Unknown category ids fall back to the first category, then to a stub. */
export const categoryOf = (
  categories: Category[],
  id: CategoryId | null,
): Category =>
  id === null
    ? MIXED_CATEGORY
    : (categories.find((c) => c.id === id) ?? categories[0] ?? UNCATEGORIZED);

/** How the expense amount splits across categories: products when mixed. */
export const expenseShares = (
  expense: Expense,
): { categoryId: CategoryId; amount: number }[] =>
  categoryShares(expense) as { categoryId: CategoryId; amount: number }[];

export const touchesCategory = (
  expense: Expense,
  categories: Category[],
  id: CategoryId,
): boolean =>
  expenseShares(expense).some(
    (s) => categoryOf(categories, s.categoryId).id === id,
  );

export type CategoryTab = { category: Category; count: number; total: number };

/** Categories used by `list`, biggest spend first. */
export const categoryTabs = (
  list: Expense[],
  categories: Category[],
): CategoryTab[] => {
  const tabs = new Map<CategoryId, CategoryTab>();
  for (const e of list) {
    for (const share of expenseShares(e)) {
      const category = categoryOf(categories, share.categoryId);
      const tab = tabs.get(category.id) ?? { category, count: 0, total: 0 };
      tabs.set(category.id, {
        category,
        count: tab.count + 1,
        total: tab.total + share.amount,
      });
    }
  }
  return [...tabs.values()].sort((a, b) => b.total - a.total);
};

export const sumAmount = (list: Expense[]): number =>
  list.reduce((total, e) => total + e.amount, 0);

/**
 * Limits are monthly budgets: they follow the month the period ends in, or
 * the present month when the period is still running.
 */
export const limitsMonth = (period: Period, today: string): Month =>
  (period.to < today ? period.to : today).slice(0, 7) as Month;

/** Smallest "round" step (1, 2, 5 × 10ⁿ) that fits `ticks` rows over `max`. */
export const niceStep = (max: number, ticks: number): number => {
  const raw = Math.max(max, 1) / ticks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const factor = [1, 2, 5, 10].find((f) => normalized <= f) ?? 10;
  return factor * magnitude;
};

const pctOf = (spent: number, amount: number): number =>
  amount > 0 ? (spent / amount) * 100 : 0;

export const isCategoryLimit = (limit: Limit): limit is CategoryLimit =>
  limit.scope === 'category';

export const limitTone = (pct: number): ProgressTone =>
  pct >= 100 ? 'danger' : pct >= WARN_PCT ? 'warn' : 'brand';

/** Limits are monthly: both progress helpers scale them to `period`. */
export const totalProgress = (
  limits: Limit[],
  expenses: Expense[],
  period: Period,
): TotalProgress | null => {
  const total = limits.find((l) => l.scope === 'total');
  if (!total) return null;
  const spent = sumAmount(expensesInPeriod(expenses, period));
  const amount = limitForPeriod(total.amount, period);
  return { spent, amount, pct: pctOf(spent, amount) };
};

export const categoryProgress = (
  limits: Limit[],
  expenses: Expense[],
  period: Period,
): CategoryProgress[] => {
  const scoped = expensesInPeriod(expenses, period);
  return limits.filter(isCategoryLimit).map((l) => {
    const spent = scoped
      .flatMap(expenseShares)
      .filter((s) => s.categoryId === l.categoryId)
      .reduce((total, s) => total + s.amount, 0);
    const amount = limitForPeriod(l.amount, period);
    return {
      id: l.id,
      categoryId: l.categoryId,
      spent,
      amount,
      pct: pctOf(spent, amount),
      alertAt80: l.alertAt80,
    };
  });
};

/** Categories that do not have a category limit yet. */
export const withoutLimit = (
  categories: Category[],
  limits: Limit[],
): Category[] =>
  categories.filter(
    (c) => !limits.some((l) => isCategoryLimit(l) && l.categoryId === c.id),
  );
