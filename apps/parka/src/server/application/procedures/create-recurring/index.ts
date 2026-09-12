import { createRecurringSchema } from '@schemas/recurring';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createRecurring = privateProcedure({
  schema: withZodSchema({ schema: createRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    const { data, error } = await db
      .from('recurring_expenses')
      .insert({
        user_id: uid,
        id: input.id,
        name: input.name,
        cost: input.cost,
        next_payment_date: input.nextPaymentDate,
        active: input.active,
        payment_method: input.paymentMethod,
        category_id: input.categoryId,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error.message);

    if (input.history.length > 0) {
      const { error: historyError } = await db
        .from('recurring_payments')
        .insert(
          input.history.map((h) => ({
            user_id: uid,
            recurring_id: input.id,
            date: h.date,
            amount: h.amount,
          })),
        );
      if (historyError) throw new InternalServer(historyError.message);
    }

    return {
      code: 201 as const,
      data: {
        id: data.id,
        name: data.name,
        cost: Number(data.cost),
        nextPaymentDate: data.next_payment_date,
        active: data.active,
        paymentMethod: data.payment_method,
        categoryId: data.category_id,
        history: input.history,
      },
    };
  },
});
