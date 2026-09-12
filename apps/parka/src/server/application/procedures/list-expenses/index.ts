import type { FinanceState } from '@schemas/state';
import { listExpensesSchema } from '@schemas/expenses';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const listExpenses = privateProcedure({
  schema: withZodSchema({ schema: listExpensesSchema }),
})({
  handler: async (_input, { db }) => {
    const [expenses, items] = await Promise.all([
      db.from('expenses').select('*'),
      db.from('receipt_items').select('*'),
    ]);
    if (expenses.error) throw new InternalServer(expenses.error.message);
    if (items.error) throw new InternalServer(items.error.message);

    const itemsByExpense = new Map<
      string,
      FinanceState['expenses'][number]['items']
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
          items: itemsByExpense.get(e.id) ?? [],
        }))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    };
  },
});
