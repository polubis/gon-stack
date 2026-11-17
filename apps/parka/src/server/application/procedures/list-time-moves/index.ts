import { listTimeMovesSchema } from '@schemas/time';
import { addDays } from '@/shared/period/period';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Newest moves first; more than this many in a range are cut. */
const MOVES_LIMIT = 5000;

/**
 * Moves between two days: history rows where the day of a task changed from
 * one day to another. Planning a backlog task or sending one back is not a move.
 */
export const listTimeMoves = privateProcedure({
  schema: withZodSchema({ schema: listTimeMovesSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_task_history')
      .select('task_id, created_at')
      .eq('user_id', user.id)
      .eq('kind', 'updated')
      .eq('field', 'day')
      .not('old_value', 'is', null)
      .not('new_value', 'is', null)
      .gte('created_at', `${addDays(input.from, -1)}T00:00:00.000Z`)
      .lt('created_at', `${addDays(input.to, 2)}T00:00:00.000Z`)
      .order('created_at', { ascending: false })
      .limit(MOVES_LIMIT);
    if (error) throw fromSupabaseError(error);

    return {
      code: 200 as const,
      data: {
        items: data.map((row) => ({ taskId: row.task_id, at: row.created_at })),
      },
    };
  },
});
