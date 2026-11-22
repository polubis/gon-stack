import { deleteTimePrioritySchema } from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Tasks and series keep their priority (`on delete restrict`): a used one answers 409. */
export const deleteTimePriority = privateProcedure({
  schema: withZodSchema({ schema: deleteTimePrioritySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_priorities')
      .delete()
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Priority not found');

    return { code: 200 as const, ok: true as const };
  },
});
