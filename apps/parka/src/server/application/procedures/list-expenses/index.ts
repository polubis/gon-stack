import type { z } from 'zod';
import { listExpensesSchema } from '@schemas/expenses';
import { receiptItem } from '@schemas/general';
import { todayDay } from '@/shared/period/period';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toDevice } from '../../shared/device';
import { materializeRecurring } from '../../shared/recurring';

export const listExpenses = privateProcedure({
  schema: withZodSchema({ schema: listExpensesSchema }),
})({
  handler: async (input, { db, user }) => {
    // Due recurring charges become expenses on the first read of the day.
    // Without the caller's zone "today" is a guess: do not charge early.
    if (input.tz) await materializeRecurring(db, user.id, todayDay(input.tz));

    const [expenses, items] = await Promise.all([
      db.from('expenses').select('*'),
      db.from('receipt_items').select('*'),
    ]);
    if (expenses.error) throw new InternalServer(expenses.error);
    if (items.error) throw new InternalServer(items.error);

    const itemsByExpense = new Map<
      string,
      z.infer<ReturnType<typeof receiptItem>>[]
    >();
    for (const it of items.data) {
      const list = itemsByExpense.get(it.expense_id) ?? [];
      list.push({
        id: it.id,
        name: it.name,
        unitPrice: Number(it.unit_price),
        quantity: Number(it.quantity),
        discount: Number(it.discount),
        categoryId: it.category_id,
      });
      itemsByExpense.set(it.expense_id, list);
    }

    return {
      code: 200 as const,
      data: expenses.data
        .map((e) => ({
          id: e.id,
          merchant: e.merchant,
          date: e.date,
          amount: Number(e.amount),
          categoryId: e.category_id,
          paymentMethod: e.payment_method,
          isBill: e.is_bill,
          source: e.source as 'receipt' | 'manual',
          device: toDevice(e),
          recurringId: e.recurring_id,
          occurrenceDate: e.occurrence_date,
          items: itemsByExpense.get(e.id) ?? [],
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    };
  },
});
