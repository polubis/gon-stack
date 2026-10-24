import { sendTimeTaskToBacklogSchema } from '@schemas/time';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { NotFound } from '../../core/error-handling';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles } from '../../shared/device';
import { toTimeBacklogTask } from '../../shared/time';

/** Takes a plain task off the board; a task made by a rule stays where it is. */
export const sendTimeTaskToBacklog = privateProcedure({
  schema: withZodSchema({ schema: sendTimeTaskToBacklogSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_tasks')
      .update({ day: null, at: null, done: false, in_progress: false })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .is('recurring_id', null)
      .select()
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Task not found');

    return {
      code: 200 as const,
      data: toTimeBacklogTask(data, await loadProfiles(db)),
    };
  },
});
