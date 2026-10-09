import { getDashboardSchema } from '@schemas/dashboard';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { occurrencesInMonth } from '@/shared/recurring/occurrences';
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

    const [expenses, categories, limits, profile, recurring, payments] =
      await Promise.all([
        db
          .from('expenses')
          .select('date, amount, category_id')
          .gte('date', rangeStart)
          .lt('date', rangeEnd),
        db.from('categories').select('id, name, color'),
        db.from('limits').select('amount').eq('scope', 'total'),
        db.from('profiles').select('name').maybeSingle(),
        db
          .from('recurring_expenses')
          .select('id, name, cost, next_payment_date, active, category_id'),
        db.from('recurring_payments').select('recurring_id, date'),
      ]);
    if (expenses.error) throw new InternalServer(expenses.error);
    if (categories.error) throw new InternalServer(categories.error);
    if (limits.error) throw new InternalServer(limits.error);
    if (profile.error) throw new InternalServer(profile.error);
    if (recurring.error) throw new InternalServer(recurring.error);
    if (payments.error) throw new InternalServer(payments.error);

    // Recurring payments are never stored as expenses: each month's charges
    // are derived from the schedule, so every total and limit sees them.
    const schedule = recurring.data.map((r) => ({
      id: r.id,
      name: r.name,
      cost: Number(r.cost),
      nextPaymentDate: r.next_payment_date,
      active: r.active,
      categoryId: r.category_id,
      history: payments.data.filter((h) => h.recurring_id === r.id),
    }));
    const recurringExpenses = monthsEndingAt(input.month, FETCH_MONTHS)
      .flatMap((month) => occurrencesInMonth(schedule, month))
      .map((o) => ({
        date: o.date,
        amount: o.amount,
        categoryId: o.categoryId,
      }));

    const data = summarizeDashboard({
      expenses: [
        ...expenses.data.map((e) => ({
          date: e.date,
          amount: Number(e.amount),
          categoryId: e.category_id,
        })),
        ...recurringExpenses,
      ],
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
