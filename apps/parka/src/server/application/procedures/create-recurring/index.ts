import { createRecurringSchema } from '@schemas/recurring';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { replaceRuleItems, ruleTotals, toRule } from '../../shared/recurring';

export const createRecurring = privateProcedure({
  schema: withZodSchema({ schema: createRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    const { cost, categoryId } = ruleTotals(input);
    const { data, error } = await db
      .from('recurring_expenses')
      .insert({
        user_id: user.id,
        id: input.id,
        name: input.name,
        cost,
        interval: input.interval,
        start_date: input.startDate,
        end_date: input.endDate,
        active: input.active,
        payment_method: input.paymentMethod,
        category_id: categoryId,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error);

    const items = await replaceRuleItems(db, user.id, input.id, input.items);

    return { code: 201 as const, data: toRule(data, items) };
  },
});
