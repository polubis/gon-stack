import { deleteTimeRecurringSchema } from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Removes the rule; its tasks stay as ordinary ones (FK sets null). */
export const deleteTimeRecurring = privateProcedure({
  schema: withZodSchema({ schema: deleteTimeRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_recurring')
      .delete()
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Recurring task not found');

    return { code: 200 as const, ok: true as const };
  },
});
