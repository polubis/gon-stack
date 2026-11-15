import { summarizeDashboard } from '@/shared/dashboard-summary/summarize';
import { shiftPeriod } from '@/shared/period/period';
import type { Category, CategoryId, Expense, Limit, Summary } from './models';
import type { Period } from '@/shared/period/period';

/**
 * Statistics of `period` counted from the loaded expenses: moving between
 * periods never asks the server again. The period before it feeds the
 * comparison.
 */
export const summarizePeriod = ({
  expenses,
  categories,
  limits,
  period,
  today,
  timeZone,
}: {
  expenses: Expense[];
  categories: Category[];
  limits: Limit[];
  period: Period;
  today: string;
  timeZone?: string;
}): Summary => {
  const total = limits.find((l) => l.scope === 'total');
  const summary = summarizeDashboard({
    expenses,
    categories,
    period,
    previous: shiftPeriod(period, -1),
    today,
    monthlyLimit: total ? total.amount : null,
    timeZone,
  });
  return {
    ...summary,
    categories: summary.categories.map((c) => ({
      id: c.categoryId as CategoryId,
      name: c.name,
      color: c.color,
      amount: c.amount,
      pct: c.pct,
    })),
  };
};
