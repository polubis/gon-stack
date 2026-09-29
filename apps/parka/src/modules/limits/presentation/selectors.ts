import { UNCATEGORIZED, WARN_PCT } from '../configuration/constraints';
import { monthOf } from '../domain/format';
import type {
  Category,
  CategoryId,
  CategoryLimit,
  CategoryProgress,
  Expense,
  Goal,
  Limit,
  Month,
  ProgressTone,
  TotalProgress,
} from '../domain/models';

const pctOf = (spent: number, amount: number): number =>
  amount > 0 ? (spent / amount) * 100 : 0;

const sum = (list: Expense[]): number =>
  list.reduce((total, e) => total + e.amount, 0);

const inMonth = (expenses: Expense[], month: Month): Expense[] =>
  expenses.filter((e) => monthOf(e.date) === month);

export const isCategoryLimit = (limit: Limit): limit is CategoryLimit =>
  limit.scope === 'category';

export const tone = (pct: number): ProgressTone =>
  pct >= 100 ? 'danger' : pct >= WARN_PCT ? 'warn' : 'brand';

/** Matching category, else the first one, else a placeholder. */
export const resolveCategory = (
  categories: Category[],
  id: CategoryId,
): Category =>
  categories.find((c) => c.id === id) ?? categories[0] ?? UNCATEGORIZED;

export const totalProgress = (
  limits: Limit[],
  expenses: Expense[],
  month: Month,
): TotalProgress | null => {
  const total = limits.find((l) => l.scope === 'total');
  if (!total) return null;
  const spent = sum(inMonth(expenses, month));
  return { spent, amount: total.amount, pct: pctOf(spent, total.amount) };
};

export const categoryProgress = (
  limits: Limit[],
  expenses: Expense[],
  month: Month,
): CategoryProgress[] => {
  const scoped = inMonth(expenses, month);
  return limits.filter(isCategoryLimit).map((l) => {
    const spent = sum(scoped.filter((e) => e.categoryId === l.categoryId));
    return {
      categoryId: l.categoryId,
      spent,
      amount: l.amount,
      pct: pctOf(spent, l.amount),
      alertAt80: l.alertAt80,
    };
  });
};

export const goalPct = (goal: Goal): number => pctOf(goal.saved, goal.target);

/** Categories that do not have a category limit yet. */
export const withoutLimit = (
  categories: Category[],
  limits: Limit[],
): Category[] =>
  categories.filter(
    (c) => !limits.some((l) => isCategoryLimit(l) && l.categoryId === c.id),
  );
