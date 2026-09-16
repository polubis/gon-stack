import {
  monthTotal,
  changeVsPrevMonth,
  categoryBreakdown,
  trend,
  type ParkaState,
} from '@/modules/shared/data';
import { TREND_MONTHS } from '../configuration/constraints';
import type { DashboardSummary } from '../domain/models';

export const toLocalSummary = (
  state: ParkaState,
  month: string,
): DashboardSummary => ({
  total: monthTotal(state, month),
  change: changeVsPrevMonth(state, month),
  trend: trend(state, month, TREND_MONTHS),
  categories: categoryBreakdown(state, [month]).map((s) => ({
    categoryId: s.category.id,
    name: s.category.name,
    color: s.category.color,
    amount: s.amount,
    pct: s.pct,
  })),
});
