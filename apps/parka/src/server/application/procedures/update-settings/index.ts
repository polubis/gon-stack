import { updateSettingsSchema } from '@schemas/settings';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateSettings = privateProcedure({
  schema: withZodSchema({ schema: updateSettingsSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    const { error: profileError } = await db.from('profiles').upsert({
      user_id: uid,
      name: input.profile.name,
      email: input.profile.email,
    });
    if (profileError) throw new InternalServer(profileError.message);

    const { error: prefsError } = await db
      .from('notification_preferences')
      .upsert({
        user_id: uid,
        push: input.notifications.push,
        email: input.notifications.email,
        limit_warnings: input.notifications.limitWarnings,
        receipt_confirmations: input.notifications.receiptConfirmations,
        limit_alerts: input.notifications.limitAlerts,
      });
    if (prefsError) throw new InternalServer(prefsError.message);

    return { code: 200 as const, data: input };
  },
});
