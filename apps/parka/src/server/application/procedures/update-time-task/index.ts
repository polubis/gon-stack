import { updateTimeTaskSchema } from '@schemas/time';
import { BadRequest, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles } from '../../shared/device';
import { toTimeTask } from '../../shared/time';
import { editTaskSeries, seriesTaskIds } from '../../shared/time-scope';

/**
 * The device and the rule of a task belong to its creation: never taken from
 * the request. `scope` (for a task of a rule) also reaches the other tasks of
 * its series and the rule, counted from the task's own occurrence day.
 */
export const updateTimeTask = privateProcedure({
  schema: withZodSchema({ schema: updateTimeTaskSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data: previous, error: previousError } = await db
      .from('time_tasks')
      .select('recurring_id, occurrence_date')
      .eq('id', input.id)
      .eq('user_id', user.id)
      .maybeSingle();
    if (previousError) throw fromSupabaseError(previousError);
    if (!previous) throw new NotFound(undefined, 'Task not found');

    // The series is read from the stored row, never from the request.
    const anchor = previous.occurrence_date;
    const series =
      previous.recurring_id !== null &&
      anchor !== null &&
      input.scope !== 'this'
        ? { ruleId: previous.recurring_id, anchor }
        : null;
    // "Only the following" leaves the opened task as it is.
    const keepsAnchor = series !== null && input.scope === 'following';

    const { data, error } = keepsAnchor
      ? await db
          .from('time_tasks')
          .select()
          .eq('id', input.id)
          .eq('user_id', user.id)
          .maybeSingle()
      : await db
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
            status_id: input.inProgress && !input.done ? input.statusId : null,
          })
          .eq('id', input.id)
          .eq('user_id', user.id)
          .select()
          .maybeSingle();
    if (error?.code === '23503')
      throw new BadRequest(error, 'Unknown category, priority or status');
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Task not found');

    if (series) {
      const ids = (
        await seriesTaskIds(
          db,
          user.id,
          series.ruleId,
          input.scope,
          series.anchor,
        )
      ).filter((id) => id !== input.id);
      await editTaskSeries(db, user.id, series.ruleId, ids, input.scope, {
        title: input.title,
        description: input.description || null,
        categoryId: input.categoryId,
        priorityId: input.priorityId,
        at: input.at,
      });
    }

    return {
      code: 200 as const,
      data: toTimeTask(data, await loadProfiles(db)),
    };
  },
});
