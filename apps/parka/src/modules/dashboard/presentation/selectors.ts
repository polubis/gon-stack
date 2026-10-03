import { occurrencesInMonth } from '@/shared/recurring/occurrences';
import { UNCATEGORIZED, WARN_PCT } from '../configuration/constraints';
import { monthOf, prevMonth } from '../domain/format';
import type {
  Category,
  CategoryId,
  CategoryLimit,
  CategoryProgress,
  Expense,
  ExpenseId,
  Limit,
  Month,
  ProgressTone,
  Recurring,
  RecurringId,
  TotalProgress,
} from '../domain/models';

/** Id of the derived charge `recurringId` makes in `month`. */
export const recurringChargeId = (
  recurringId: RecurringId,
  month: Month,
): ExpenseId => `recurring:${recurringId}:${month}` as ExpenseId;

/**
 * Stored expenses plus `month`'s charges of the recurring ones, so every
 * total and limit counts them. Those charges are derived, never stored.
 */
export const withRecurring = (
  expenses: Expense[],
  recurring: Recurring[],
  month: Month,
): Expense[] => [
  ...expenses,
  ...occurrencesInMonth(recurring, month).map((o) => ({
    id: recurringChargeId(o.recurringId as RecurringId, month),
    merchant: o.name,
    date: `${o.date}T00:00:00.000Z`,
    amount: o.amount,
    categoryId: o.categoryId as CategoryId,
    paymentMethod:
      recurring.find((r) => r.id === o.recurringId)?.paymentMethod ?? '',
    isBill: true,
    source: 'recurring' as const,
    items: [],
  })),
];

export const sortByDateDesc = (list: Expense[]): Expense[] =>
  [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

export const expensesInMonth = (list: Expense[], month: Month): Expense[] =>
  sortByDateDesc(list.filter((e) => monthOf(e.date) === month));

/** Unknown category ids fall back to the first category, then to a stub. */
export const categoryOf = (categories: Category[], id: CategoryId): Category =>
  categories.find((c) => c.id === id) ?? categories[0] ?? UNCATEGORIZED;

export type CategoryTab = { category: Category; count: number; total: number };

/** Categories used by `list`, biggest spend first. */
export const categoryTabs = (
  list: Expense[],
  categories: Category[],
): CategoryTab[] => {
  const tabs = new Map<CategoryId, CategoryTab>();
  for (const e of list) {
    const category = categoryOf(categories, e.categoryId);
    const tab = tabs.get(category.id) ?? { category, count: 0, total: 0 };
    tabs.set(category.id, {
      category,
      count: tab.count + 1,
      total: tab.total + e.amount,
    });
  }
  return [...tabs.values()].sort((a, b) => b.total - a.total);
};

export const sumAmount = (list: Expense[]): number =>
  list.reduce((total, e) => total + e.amount, 0);

/** Newest first: `count` months ending at `current`, plus `selected` if older. */
export const monthOptions = (
  selected: Month,
  current: Month,
  count: number,
): Month[] => {
  const months = Array.from({ length: count - 1 }).reduce<Month[]>(
    (acc) => [...acc, prevMonth(acc[acc.length - 1])],
    [current],
  );
  return months.includes(selected) ? months : [selected, ...months];
};

/**
 * Keeps the `max` biggest slices and folds the rest into one "other" slice,
 * merged with slices that already are "other" (`isOther`), always last.
 */
export const foldSlices = <T extends { value: number; isOther?: boolean }>(
  slices: T[],
  max: number,
  other: (rest: number) => T,
): T[] => {
  const named = slices.filter((s) => !s.isOther);
  const existing = slices
    .filter((s) => s.isOther)
    .reduce((total, s) => total + s.value, 0);
  if (named.length <= max && existing === 0) return named;
  const sorted = [...named].sort((a, b) => b.value - a.value);
  const rest = sorted.slice(max).reduce((total, s) => total + s.value, 0);
  return [...sorted.slice(0, max), other(rest + existing)];
};

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

export const totalProgress = (
  limits: Limit[],
  expenses: Expense[],
  month: Month,
): TotalProgress | null => {
  const total = limits.find((l) => l.scope === 'total');
  if (!total) return null;
  const spent = sumAmount(expensesInMonth(expenses, month));
  return { spent, amount: total.amount, pct: pctOf(spent, total.amount) };
};

export const categoryProgress = (
  limits: Limit[],
  expenses: Expense[],
  month: Month,
): CategoryProgress[] => {
  const scoped = expensesInMonth(expenses, month);
  return limits.filter(isCategoryLimit).map((l) => {
    const spent = sumAmount(
      scoped.filter((e) => e.categoryId === l.categoryId),
    );
    return {
      id: l.id,
      categoryId: l.categoryId,
      spent,
      amount: l.amount,
      pct: pctOf(spent, l.amount),
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
