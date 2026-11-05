import { deleteRecurringSchema } from '@schemas/recurring';
import { NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

/** Removes the rule; its expenses stay as ordinary ones (FK sets null). */
export const deleteRecurring = privateProcedure({
  schema: withZodSchema({ schema: deleteRecurringSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('recurring_expenses')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Recurring expense not found');

    return { code: 200 as const, ok: true as const };
  },
});
