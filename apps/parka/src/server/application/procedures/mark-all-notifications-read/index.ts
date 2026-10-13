import { markAllNotificationsReadSchema } from '@schemas/notifications';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const markAllNotificationsRead = privateProcedure({
  schema: withZodSchema({ schema: markAllNotificationsReadSchema }),
})({
  handler: async (_input, { db }) => {
    const { error } = await db
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);
    if (error) throw new InternalServer(error);

    return { code: 200 as const, ok: true as const };
  },
});
