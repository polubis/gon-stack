import { createNotificationSchema } from '@schemas/notifications';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createNotification = privateProcedure({
  schema: withZodSchema({ schema: createNotificationSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('notifications')
      .insert({
        user_id: user.id,
        id: input.id,
        kind: input.kind,
        title: input.title,
        body: input.body,
        age_days: input.ageDays,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error.message);

    return {
      code: 201 as const,
      data: {
        id: data.id,
        kind: data.kind,
        title: data.title,
        body: data.body,
        ageDays: Number(data.age_days),
      },
    };
  },
});
