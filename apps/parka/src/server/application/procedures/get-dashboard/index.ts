import { getDashboardSchema } from '@schemas/dashboard';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  monthsEndingAt,
  nextMonthOf,
  summarizeDashboard,
} from '@/server/domain/dashboard';

const DEFAULT_TREND_MONTHS = 6;
// The previous month is always needed for the month-over-month comparison.
const MIN_FETCH_MONTHS = 2;

export const getDashboard = privateProcedure({
  schema: withZodSchema({ schema: getDashboardSchema }),
})({
  handler: async (input, { db }) => {
    const trendMonths = input.trendMonths ?? DEFAULT_TREND_MONTHS;
    const rangeStart = `${
      monthsEndingAt(input.month, Math.max(trendMonths, MIN_FETCH_MONTHS))[0]
    }-01`;
    const rangeEnd = `${nextMonthOf(input.month)}-01`;

    const [expenses, categories] = await Promise.all([
      db
        .from('expenses')
        .select('date, amount, category_id')
        .gte('date', rangeStart)
        .lt('date', rangeEnd),
      db.from('categories').select('id, name, color'),
    ]);
    if (expenses.error) throw new InternalServer(expenses.error.message);
    if (categories.error) throw new InternalServer(categories.error.message);

    const data = summarizeDashboard({
      expenses: expenses.data.map((e) => ({
        date: e.date,
        amount: Number(e.amount),
        categoryId: e.category_id,
      })),
      categories: categories.data.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      })),
      month: input.month,
      trendMonths,
    });

    return { code: 200 as const, data };
  },
});
