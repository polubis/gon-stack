import { updateTimeTaskSchema } from '@schemas/time';
import { BadRequest, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles } from '../../shared/device';
import { toTimeTask } from '../../shared/time';

/** The device and the rule of a task belong to its creation: never taken from the request. */
export const updateTimeTask = privateProcedure({
  schema: withZodSchema({ schema: updateTimeTaskSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_tasks')
      .update({
        title: input.title,
        description: input.description || null,
        category_id: input.categoryId,
        priority_id: input.priorityId,
        day: input.day,
        at: input.at,
        done: input.done,
        in_progress: input.inProgress && !input.done,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error?.code === '23503')
      throw new BadRequest(error, 'Unknown category or priority');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Task not found');

    return {
      code: 200 as const,
      data: toTimeTask(data, await loadProfiles(db)),
    };
  },
});
