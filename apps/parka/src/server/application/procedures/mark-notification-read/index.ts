import { markNotificationReadSchema } from '@schemas/notifications';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

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
    if (error) throw new InternalServer(error);

    if (data.length === 0) {
      // Already read is fine; a missing row is not.
      const { data: existing, error: lookupError } = await db
        .from('notifications')
        .select('id')
        .eq('id', input.id);
      if (lookupError) throw new InternalServer(lookupError);
      if (existing.length === 0)
        throw new NotFound(undefined, 'Notification not found');
    }

    return { code: 200 as const, ok: true as const };
  },
});
