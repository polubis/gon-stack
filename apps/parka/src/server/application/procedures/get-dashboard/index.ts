import { getDashboardSchema } from '@schemas/dashboard';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  monthsEndingAt,
  nextMonthOf,
  summarizeDashboard,
} from '@/server/domain/dashboard';

// The previous month is needed for the month-over-month comparison.
const FETCH_MONTHS = 2;

export const getDashboard = privateProcedure({
  schema: withZodSchema({ schema: getDashboardSchema }),
})({
  handler: async (input, { db }) => {
    const rangeStart = `${monthsEndingAt(input.month, FETCH_MONTHS)[0]}-01`;
    const rangeEnd = `${nextMonthOf(input.month)}-01`;

    const [expenses, categories, limits, profile] = await Promise.all([
      db
        .from('expenses')
        .select('date, amount, category_id')
        .gte('date', rangeStart)
        .lt('date', rangeEnd),
      db.from('categories').select('id, name, color'),
      db.from('limits').select('amount').eq('scope', 'total'),
      db.from('profiles').select('name').maybeSingle(),
    ]);
    if (expenses.error) throw new InternalServer(expenses.error.message);
    if (categories.error) throw new InternalServer(categories.error.message);
    if (limits.error) throw new InternalServer(limits.error.message);
    if (profile.error) throw new InternalServer(profile.error.message);

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
      today: new Date().toISOString().slice(0, 10),
      monthlyLimit: limits.data[0] ? Number(limits.data[0].amount) : null,
    });

    return {
      code: 200 as const,
      data: { ...data, userName: profile.data?.name ?? '' },
    };
  },
});
