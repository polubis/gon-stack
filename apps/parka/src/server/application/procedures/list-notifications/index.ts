import { listNotificationsSchema } from '@schemas/notifications';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const listNotifications = privateProcedure({
  schema: withZodSchema({ schema: listNotificationsSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.from('notifications').select('*');
    if (error) throw new InternalServer(error.message);

    return {
      code: 200 as const,
      data: data
        .map((n) => ({
          id: n.id,
          kind: n.kind,
          title: n.title,
          body: n.body,
          ageDays: Number(n.age_days),
        }))
        .sort((a, b) => a.ageDays - b.ageDays),
    };
  },
});
