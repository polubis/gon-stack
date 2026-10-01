import { monthOf } from '../domain/format';
import type { Expense, Month } from '../domain/models';

export const sortByDateDesc = (list: Expense[]): Expense[] =>
  [...list].sort((a, b) => (a.date < b.date ? 1 : -1));

/** Groups by `YYYY-MM`, newest month first. */
export const groupByMonth = (list: Expense[]): [Month, Expense[]][] => {
  const map = new Map<Month, Expense[]>();
  for (const e of list) {
    const key = monthOf(e.date);
    map.set(key, [...(map.get(key) ?? []), e]);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
};

export const sumAmount = (list: Expense[]): number =>
  list.reduce((total, e) => total + e.amount, 0);
