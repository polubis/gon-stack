import { createTimeBacklogTaskSchema } from '@schemas/time';
import { BadRequest } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { deviceColumns, loadProfiles } from '../../shared/device';
import { toTimeBacklogTask } from '../../shared/time';

/** A task row with no day: it waits in the backlog until it is moved. */
export const createTimeBacklogTask = privateProcedure({
  schema: withZodSchema({ schema: createTimeBacklogTaskSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_tasks')
      .upsert(
        {
          user_id: user.id,
          id: input.id,
          title: input.title,
          category_id: input.categoryId,
          priority_id: input.priorityId,
          day: null,
          at: null,
          done: false,
          ...deviceColumns(input.device),
        },
        { onConflict: 'user_id,id' },
      )
      .select()
      .single();
    if (error?.code === '23503')
      throw new BadRequest(error, 'Unknown category or priority');
    if (error) throw fromSupabaseError(error);

    return {
      code: 201 as const,
      data: toTimeBacklogTask(data, await loadProfiles(db)),
    };
  },
});
