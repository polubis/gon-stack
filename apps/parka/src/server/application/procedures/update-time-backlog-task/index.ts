import { updateTimeBacklogTaskSchema } from '@schemas/time';
import { BadRequest, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles } from '../../shared/device';
import { toTimeBacklogTask } from '../../shared/time';

/** Edits a task that has no day; it stays in the backlog. Device is never taken from the request. */
export const updateTimeBacklogTask = privateProcedure({
  schema: withZodSchema({ schema: updateTimeBacklogTaskSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_tasks')
      .update({
        title: input.title,
        category_id: input.categoryId,
        priority_id: input.priorityId,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .is('day', null)
      .select()
      .maybeSingle();
    if (error?.code === '23503')
      throw new BadRequest(error, 'Unknown category or priority');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Task not found');

    return {
      code: 200 as const,
      data: toTimeBacklogTask(data, await loadProfiles(db)),
    };
  },
});
