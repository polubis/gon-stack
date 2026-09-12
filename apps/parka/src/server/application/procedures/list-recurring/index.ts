import { listRecurringSchema } from '@schemas/recurring';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const listRecurring = privateProcedure({
  schema: withZodSchema({ schema: listRecurringSchema }),
})({
  handler: async (_input, { db }) => {
    const [recurring, payments] = await Promise.all([
      db.from('recurring_expenses').select('*'),
      db
        .from('recurring_payments')
        .select('*')
        .order('date', { ascending: false }),
    ]);
    if (recurring.error) throw new InternalServer(recurring.error.message);
    if (payments.error) throw new InternalServer(payments.error.message);

    const historyByRecurring = new Map<
      string,
      { date: string; amount: number }[]
    >();
    for (const p of payments.data) {
      const list = historyByRecurring.get(p.recurring_id) ?? [];
      list.push({ date: p.date, amount: Number(p.amount) });
      historyByRecurring.set(p.recurring_id, list);
    }

    return {
      code: 200 as const,
      data: recurring.data.map((r) => ({
        id: r.id,
        name: r.name,
        cost: Number(r.cost),
        nextPaymentDate: r.next_payment_date,
        active: r.active,
        paymentMethod: r.payment_method,
        categoryId: r.category_id,
        history: historyByRecurring.get(r.id) ?? [],
      })),
    };
  },
});
