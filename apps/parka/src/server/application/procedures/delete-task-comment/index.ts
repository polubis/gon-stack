import { deleteTaskCommentSchema } from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteTaskComment = privateProcedure({
  schema: withZodSchema({ schema: deleteTaskCommentSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_task_comments')
      .delete()
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select('id');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Comment not found');

    return { code: 200 as const, ok: true as const };
  },
});
