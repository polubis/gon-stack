import { createTaskCommentSchema } from '@schemas/time';
import { Conflict, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { TASK_COMMENT_COLUMNS, toTaskComment } from '../../shared/task-comment';

/** The owner writes it: bot columns are never set from the app. */
export const createTaskComment = privateProcedure({
  schema: withZodSchema({ schema: createTaskCommentSchema }),
})({
  handler: async ({ id: taskId, body }, { db, user }) => {
    const task = await db
      .from('time_tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', taskId)
      .maybeSingle();
    if (task.error) throw fromSupabaseError(task.error);
    if (!task.data) throw new NotFound(undefined, 'Task not found');

    const { data, error } = await db
      .from('time_task_comments')
      .insert({ user_id: user.id, task_id: taskId, body })
      .select(TASK_COMMENT_COLUMNS)
      .single();
    if (error?.code === '23514')
      throw new Conflict(error, 'A task takes at most 200 comments');
    if (error) throw fromSupabaseError(error);

    return { code: 201 as const, data: toTaskComment(data, new Map()) };
  },
});
