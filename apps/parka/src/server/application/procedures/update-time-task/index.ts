import { updateTimeTaskSchema } from '@schemas/time';
import { BadRequest, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toTimeTask } from '../../shared/time';

export const updateTimeTask = privateProcedure({
  schema: withZodSchema({ schema: updateTimeTaskSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_tasks')
      .update({
        title: input.title,
        category_id: input.categoryId,
        priority_id: input.priorityId,
        day: input.day,
        at: input.at,
        done: input.done,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error?.code === '23503')
      throw new BadRequest(error, 'Unknown category or priority');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Task not found');

    return { code: 200 as const, data: toTimeTask(data) };
  },
});
