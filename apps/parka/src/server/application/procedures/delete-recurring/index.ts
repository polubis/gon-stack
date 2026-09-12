import { deleteRecurringSchema } from '@schemas/recurring';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteRecurring = privateProcedure({
  schema: withZodSchema({ schema: deleteRecurringSchema }),
})({
  handler: async (input, { db }) => {
    const { error: paymentsError } = await db
      .from('recurring_payments')
      .delete()
      .eq('recurring_id', input.id);
    if (paymentsError) throw new InternalServer(paymentsError.message);

    const { data, error } = await db
      .from('recurring_expenses')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw new InternalServer(error.message);
    if (!data || data.length === 0)
      throw new NotFound('Recurring expense not found');

    return { code: 200 as const, ok: true as const };
  },
});
