import { getSettingsSchema } from '@schemas/settings';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const getSettings = privateProcedure({
  schema: withZodSchema({ schema: getSettingsSchema }),
})({
  handler: async (_input, { db }) => {
    const [profile, prefs] = await Promise.all([
      db.from('profiles').select('*').maybeSingle(),
      db.from('notification_preferences').select('*').maybeSingle(),
    ]);
    if (profile.error) throw new InternalServer(profile.error.message);
    if (prefs.error) throw new InternalServer(prefs.error.message);

    return {
      code: 200 as const,
      data: {
        profile: {
          name: profile.data?.name ?? 'Anna Kowalska',
          email: profile.data?.email ?? '',
        },
        notifications: {
          push: prefs.data?.push ?? true,
          email: prefs.data?.email ?? false,
          limitWarnings: prefs.data?.limit_warnings ?? true,
          receiptConfirmations: prefs.data?.receipt_confirmations ?? true,
          limitAlerts: prefs.data?.limit_alerts ?? true,
        },
      },
    };
  },
});
