import { updateTaskCommentSchema } from '@schemas/time';
import { InternalServer, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  TASK_COMMENT_COLUMNS,
  tokenNames,
  toTaskComment,
} from '../../shared/task-comment';

/** Changes only the text; the database stamps the edit time and keeps the author. */
export const updateTaskComment = privateProcedure({
  schema: withZodSchema({ schema: updateTaskCommentSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_task_comments')
      .update({ body: input.body })
      .eq('user_id', user.id)
      .eq('id', input.id)
      .select(TASK_COMMENT_COLUMNS)
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Comment not found');

    const tokens = data.mcp_token_id
      ? await db
          .from('mcp_tokens')
          .select('id, name')
          .eq('id', data.mcp_token_id)
      : { data: [], error: null };
    if (tokens.error) throw new InternalServer(tokens.error);

    return {
      code: 200 as const,
      data: toTaskComment(data, tokenNames(tokens.data)),
    };
  },
});
