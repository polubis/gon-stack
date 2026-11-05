import { markNotificationReadSchema } from '@schemas/notifications';
import { NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const markNotificationRead = privateProcedure({
  schema: withZodSchema({ schema: markNotificationReadSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', input.id)
      .is('read_at', null)
      .select('id');
    if (error) throw fromSupabaseError(error);

    if (data.length === 0) {
      // Already read is fine; a missing row is not.
      const { data: existing, error: lookupError } = await db
        .from('notifications')
        .select('id')
        .eq('id', input.id);
      if (lookupError) throw fromSupabaseError(lookupError);
      if (existing.length === 0)
        throw new NotFound(undefined, 'Notification not found');
    }

    return { code: 200 as const, ok: true as const };
  },
});
