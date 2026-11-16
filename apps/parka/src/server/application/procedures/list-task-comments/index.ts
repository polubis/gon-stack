import { listTaskCommentsSchema } from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toAvatar } from '../../shared/avatar';
import {
  TASK_COMMENT_COLUMNS,
  tokenNames,
  toTaskComment,
} from '../../shared/task-comment';

const text = (value: unknown) =>
  typeof value === 'string' && value ? value : null;

export const listTaskComments = privateProcedure({
  schema: withZodSchema({ schema: listTaskCommentsSchema }),
})({
  handler: async (input, { db, user }) => {
    // Independent reads start together; the ownership check still decides first.
    const [task, comments, me, avatar] = await Promise.all([
      db
        .from('time_tasks')
        .select('id')
        .eq('user_id', user.id)
        .eq('id', input.id)
        .maybeSingle(),
      db
        .from('time_task_comments')
        .select(TASK_COMMENT_COLUMNS)
        .eq('user_id', user.id)
        .eq('task_id', input.id)
        .order('created_at')
        .order('id'),
      db.auth.getUser(),
      db.from('profile_avatars').select('updated_at').maybeSingle(),
    ]);
    if (task.error) throw fromSupabaseError(task.error);
    if (!task.data) throw new NotFound(undefined, 'Task not found');
    if (comments.error) throw fromSupabaseError(comments.error);

    const tokenIds = [
      ...new Set(comments.data.flatMap((c) => c.mcp_token_id ?? [])),
    ];
    const tokens =
      tokenIds.length === 0
        ? { data: [], error: null }
        : await db.from('mcp_tokens').select('id, name').in('id', tokenIds);
    if (tokens.error) throw fromSupabaseError(tokens.error);
    const names = tokenNames(tokens.data);

    const meta = me.data.user?.user_metadata ?? {};
    const picture = avatar.data
      ? (toAvatar(db, user.id, avatar.data.updated_at).variants.find(
          (v) => v.size === 64,
        )?.url ?? null)
      : (text(meta.avatar_url) ?? text(meta.picture));

    return {
      code: 200 as const,
      data: {
        owner: {
          name:
            text(meta.full_name) ??
            text(meta.name) ??
            (user.username !== 'Anonymous' ? user.username : null) ??
            user.email.split('@')[0] ??
            'Ty',
          avatarUrl: picture,
        },
        items: comments.data.map((row) => toTaskComment(row, names)),
      },
    };
  },
});
