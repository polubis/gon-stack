import { UNCATEGORIZED } from '../configuration/constraints';
import { monthOf, prevMonth } from '../domain/format';
import type { Category, CategoryId, Expense, Month } from '../domain/models';

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
