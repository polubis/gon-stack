import { createRecurringSchema } from '@schemas/recurring';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toRule } from '../../shared/recurring';

export const createRecurring = privateProcedure({
  schema: withZodSchema({ schema: createRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('recurring_expenses')
      .insert({
        user_id: user.id,
        id: input.id,
        name: input.name,
        cost: input.cost,
        interval: input.interval,
        start_date: input.startDate,
        end_date: input.endDate,
        active: input.active,
        payment_method: input.paymentMethod,
        category_id: input.categoryId,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error);

    return { code: 201 as const, data: toRule(data) };
  },
});
