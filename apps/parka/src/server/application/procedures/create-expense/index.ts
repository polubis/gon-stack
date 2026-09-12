import { createExpenseSchema } from '@schemas/expenses';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createExpense = privateProcedure({
  schema: withZodSchema({ schema: createExpenseSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    const { data, error } = await db
      .from('expenses')
      .insert({
        user_id: uid,
        id: input.id,
        merchant: input.merchant,
        date: input.date,
        amount: input.amount,
        category_id: input.categoryId,
        payment_method: input.paymentMethod,
        is_bill: input.isBill,
        source: input.source,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error.message);

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
      code: 201 as const,
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
