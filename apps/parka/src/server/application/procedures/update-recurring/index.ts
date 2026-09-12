import { updateRecurringSchema } from '@schemas/recurring';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateRecurring = privateProcedure({
  schema: withZodSchema({ schema: updateRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    const { data, error } = await db
      .from('recurring_expenses')
      .update({
        name: input.name,
        cost: input.cost,
        next_payment_date: input.nextPaymentDate,
        active: input.active,
        payment_method: input.paymentMethod,
        category_id: input.categoryId,
      })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw new InternalServer(error.message);
    if (!data) throw new NotFound('Recurring expense not found');

    const { error: wipeError } = await db
      .from('recurring_payments')
      .delete()
      .eq('recurring_id', input.id);
    if (wipeError) throw new InternalServer(wipeError.message);

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
      code: 200 as const,
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
