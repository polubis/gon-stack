import { updateRecurringSchema } from '@schemas/recurring';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toRule } from '../../shared/recurring';

/**
 * Edits the rule only: expenses it already created stay as they are, so a
 * change reaches this and the following occurrences. `last_materialized_date`
 * belongs to the server and is never taken from the request.
 */
export const updateRecurring = privateProcedure({
  schema: withZodSchema({ schema: updateRecurringSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('recurring_expenses')
      .update({
        name: input.name,
        cost: input.cost,
        interval: input.interval,
        start_date: input.startDate,
        end_date: input.endDate,
        active: input.active,
        payment_method: input.paymentMethod,
        category_id: input.categoryId,
      })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw new InternalServer(error);
    if (!data) throw new NotFound(undefined, 'Recurring expense not found');

    return { code: 200 as const, data: toRule(data) };
  },
});
