import { updateExpenseSchema } from '@schemas/expenses';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateExpense = privateProcedure({
  schema: withZodSchema({ schema: updateExpenseSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    const { data, error } = await db
      .from('expenses')
      .update({
        merchant: input.merchant,
        date: input.date,
        amount: input.amount,
        category_id: input.categoryId,
        payment_method: input.paymentMethod,
        is_bill: input.isBill,
        source: input.source,
      })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw new InternalServer(error.message);
    if (!data) throw new NotFound('Expense not found');

    const { error: wipeError } = await db
      .from('receipt_items')
      .delete()
      .eq('expense_id', input.id);
    if (wipeError) throw new InternalServer(wipeError.message);

    if (input.items.length > 0) {
      const { error: itemsError } = await db.from('receipt_items').insert(
        input.items.map((it) => ({
          user_id: uid,
          id: it.id,
          expense_id: input.id,
          name: it.name,
          unit_price: it.unitPrice,
          quantity: it.quantity,
          discount: it.discount,
          category_id: it.categoryId,
        })),
      );
      if (itemsError) throw new InternalServer(itemsError.message);
    }

    return {
      code: 200 as const,
      data: {
        id: data.id,
        merchant: data.merchant,
        date: data.date,
        amount: Number(data.amount),
        categoryId: data.category_id,
        paymentMethod: data.payment_method,
        isBill: data.is_bill,
        source: data.source as 'receipt' | 'manual',
        items: input.items,
      },
    };
  },
});
