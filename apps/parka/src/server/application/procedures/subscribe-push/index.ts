import { subscribePushSchema } from '@schemas/push';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const subscribePush = privateProcedure({
  schema: withZodSchema({ schema: subscribePushSchema }),
})({
  handler: async ({ endpoint, keys }, { db, user }) => {
    const { error } = await db.from('push_subscriptions').upsert({
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
    if (error) throw new InternalServer(error);

    return { code: 200 as const, ok: true as const };
  },
});
