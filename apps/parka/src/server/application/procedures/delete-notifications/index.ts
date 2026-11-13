import { deleteNotificationsSchema } from '@schemas/notifications';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

/** Deletes the chosen notifications; ids that are already gone are skipped. */
export const deleteNotifications = privateProcedure({
  schema: withZodSchema({ schema: deleteNotificationsSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('notifications')
      .delete()
      .in('id', input.ids)
      .select('id');
    if (error) throw fromSupabaseError(error);

    return { code: 200 as const, deleted: data.length };
  },
});
