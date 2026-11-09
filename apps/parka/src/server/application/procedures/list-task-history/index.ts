import {
  listTaskHistorySchema,
  type TASK_HISTORY_FIELDS,
  type TASK_HISTORY_KINDS,
} from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { tokenNames } from '../../shared/task-comment';

/** Newest first. Read only: nothing writes history but the database itself. */
export const listTaskHistory = privateProcedure({
  schema: withZodSchema({ schema: listTaskHistorySchema }),
})({
  handler: async (input, { db, user }) => {
    const task = await db
      .from('time_tasks')
      .select('id')
      .eq('user_id', user.id)
      .eq('id', input.id)
      .maybeSingle();
    if (task.error) throw fromSupabaseError(task.error);
    if (!task.data) throw new NotFound(undefined, 'Task not found');

    const history = await db
      .from('time_task_history')
      .select(
        'id, kind, field, old_value, new_value, created_at, bot_name, bot_ref, mcp_token_id',
      )
      .eq('user_id', user.id)
      .eq('task_id', input.id)
      .order('created_at', { ascending: false })
      .order('id');
    if (history.error) throw fromSupabaseError(history.error);

    const tokenIds = [
      ...new Set(history.data.flatMap((h) => h.mcp_token_id ?? [])),
    ];
    const tokens =
      tokenIds.length === 0
        ? { data: [], error: null }
        : await db.from('mcp_tokens').select('id, name').in('id', tokenIds);
    if (tokens.error) throw fromSupabaseError(tokens.error);
    const names = tokenNames(tokens.data);

    return {
      code: 200 as const,
      data: {
        items: history.data.map((row) => ({
          id: row.id,
          // The table's check constraints keep both columns inside these unions.
          kind: row.kind as (typeof TASK_HISTORY_KINDS)[number],
          field: row.field as (typeof TASK_HISTORY_FIELDS)[number] | null,
          from: row.old_value,
          to: row.new_value,
          at: row.created_at,
          bot:
            row.bot_ref && row.bot_name
              ? {
                  name:
                    (row.mcp_token_id && names.get(row.mcp_token_id)) ||
                    row.bot_name,
                  ref: row.bot_ref,
                }
              : null,
        })),
      },
    };
  },
});
