import { saveTimeStatusesSchema } from '@schemas/time';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

/** Replaces the user's steps: stored in the order given, the ones left out are removed (their tasks fall back to `in_progress`). */
export const saveTimeStatuses = privateProcedure({
  schema: withZodSchema({ schema: saveTimeStatusesSchema }),
})({
  handler: async ({ statuses }, { db, user }) => {
    const { error } = await db.from('time_statuses').upsert(
      statuses.map(({ id, name }, position) => ({
        user_id: user.id,
        id,
        name,
        position,
      })),
      { onConflict: 'user_id,id' },
    );
    if (error) throw fromSupabaseError(error);

    // Ids match `^[\w-]+$` (contract), safe inside the filter.
    const removed = await db
      .from('time_statuses')
      .delete()
      .eq('user_id', user.id)
      .not('id', 'in', `(${statuses.map(({ id }) => id).join(',')})`);
    if (removed.error) throw fromSupabaseError(removed.error);

    return { code: 200 as const, data: { statuses } };
  },
});
