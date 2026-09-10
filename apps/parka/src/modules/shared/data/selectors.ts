import type { Category, Expense, ParkaState } from './types';
import { monthOf, prevMonth } from './format';

export const itemTotal = (i: {
  unitPrice: number;
  quantity: number;
  discount: number;
}): number => i.unitPrice * i.quantity - i.discount;

export const expensesForMonth = (state: ParkaState, month: string): Expense[] =>
  state.expenses
    .filter((e) => monthOf(e.date) === month)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

export const monthTotal = (state: ParkaState, month: string): number =>
  expensesForMonth(state, month).reduce((sum, e) => sum + e.amount, 0);

export const changeVsPrevMonth = (state: ParkaState, month: string): number => {
  const current = monthTotal(state, month);
  const previous = monthTotal(state, prevMonth(month));
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export type CategorySlice = {
  category: Category;
  amount: number;
  pct: number;
};

export const categoryBreakdown = (
  state: ParkaState,
  months: string[],
): CategorySlice[] => {
  const scoped = state.expenses.filter((e) => months.includes(monthOf(e.date)));
  const total = scoped.reduce((s, e) => s + e.amount, 0);
  return state.categories
    .map((category) => {
      const amount = scoped
        .filter((e) => e.categoryId === category.id)
        .reduce((s, e) => s + e.amount, 0);
      return {
        category,
        amount,
        pct: total === 0 ? 0 : (amount / total) * 100,
      };
    })
    .filter((s) => s.amount > 0)
    .sort((a, b) => b.amount - a.amount);
};

/** Trailing `count` months ending at `month`, oldest first. */
export const monthsEndingAt = (month: string, count: number): string[] => {
  const [y, m] = month.split('-').map(Number);
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
};

export const trend = (
  state: ParkaState,
  month: string,
  count: number,
): { month: string; total: number }[] =>
  monthsEndingAt(month, count).map((m) => ({
    month: m,
    total: monthTotal(state, m),
  }));

export const categoryById = (
  state: ParkaState,
  id: string,
): Category | undefined => state.categories.find((c) => c.id === id);

export const limitProgress = (
  state: ParkaState,
  month: string,
): {
  total: { spent: number; amount: number; pct: number } | null;
  categories: {
    categoryId: string;
    spent: number;
    amount: number;
    pct: number;
    alertAt80: boolean;
  }[];
} => {
  const monthExpenses = expensesForMonth(state, month);
  const totalLimit = state.limits.find((l) => l.scope === 'total') ?? null;
  const spentTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  return {
    total: totalLimit
      ? {
          spent: spentTotal,
          amount: totalLimit.amount,
          pct: (spentTotal / totalLimit.amount) * 100,
        }
      : null,
    categories: state.limits
      .filter((l) => l.scope === 'category' && l.categoryId)
      .map((l) => {
        const spent = monthExpenses
          .filter((e) => e.categoryId === l.categoryId)
          .reduce((s, e) => s + e.amount, 0);
        return {
          categoryId: l.categoryId as string,
          spent,
          amount: l.amount,
          pct: (spent / l.amount) * 100,
          alertAt80: l.alertAt80,
        };
      }),
  };
};

export type CategoryChange = {
  category: Category;
  changePct: number;
};

export const biggestChanges = (
  state: ParkaState,
  month: string,
): CategoryChange[] => {
  const prev = prevMonth(month);
  return state.categories
    .map((category) => {
      const now = state.expenses
        .filter(
          (e) => monthOf(e.date) === month && e.categoryId === category.id,
        )
        .reduce((s, e) => s + e.amount, 0);
      const before = state.expenses
        .filter((e) => monthOf(e.date) === prev && e.categoryId === category.id)
        .reduce((s, e) => s + e.amount, 0);
      const changePct =
        before === 0 ? (now === 0 ? 0 : 100) : ((now - before) / before) * 100;
      return { category, changePct };
    })
    .filter((c) => Math.abs(c.changePct) >= 1)
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 5);
};
