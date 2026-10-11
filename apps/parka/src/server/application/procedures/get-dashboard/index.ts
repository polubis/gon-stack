import { getDashboardSchema } from '@schemas/dashboard';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  addDays,
  clampPeriod,
  resolvePeriod,
  shiftPeriod,
  todayDay,
} from '@/shared/period/period';
import {
  chargesInPeriods,
  summarizeDashboard,
} from '@/server/domain/dashboard';

export const getDashboard = privateProcedure({
  schema: withZodSchema({ schema: getDashboardSchema }),
})({
  handler: async (input, { db }) => {
    const today = todayDay();
    // A future period holds nothing: it snaps to the present one.
    const period = clampPeriod(
      resolvePeriod(input.kind, input.from, input.to),
      today,
    );
    // The period right before it is needed for the comparison.
    const previous = shiftPeriod(period, -1);

    const [expenses, items, categories, limits, profile, recurring, payments] =
      await Promise.all([
        db
          .from('expenses')
          .select('id, date, amount, category_id')
          .gte('date', previous.from)
          .lt('date', addDays(period.to, 1)),
        db
          .from('receipt_items')
          .select('expense_id, unit_price, quantity, discount, category_id'),
        db.from('categories').select('id, name, color'),
        db.from('limits').select('amount').eq('scope', 'total'),
        db.from('profiles').select('name').maybeSingle(),
        db
          .from('recurring_expenses')
          .select('id, name, cost, next_payment_date, active, category_id'),
        db.from('recurring_payments').select('recurring_id, date'),
      ]);
    if (expenses.error) throw new InternalServer(expenses.error);
    if (items.error) throw new InternalServer(items.error);
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
    const recurringExpenses = chargesInPeriods(schedule, [
      period,
      previous,
    ]).map((o) => ({
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
          items: items.data
            .filter((it) => it.expense_id === e.id)
            .map((it) => ({
              categoryId: it.category_id,
              unitPrice: Number(it.unit_price),
              quantity: Number(it.quantity),
              discount: Number(it.discount),
            })),
        })),
        ...recurringExpenses,
      ],
      categories: categories.data.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
      })),
      period,
      previous,
      today,
      monthlyLimit: limits.data[0] ? Number(limits.data[0].amount) : null,
    });

    return {
      code: 200 as const,
      data: { ...data, userName: profile.data?.name ?? '' },
    };
  },
});
