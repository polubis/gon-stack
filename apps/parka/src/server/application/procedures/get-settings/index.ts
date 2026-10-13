import { getSettingsSchema } from '@schemas/settings';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadAvatars, toDevice } from '../../shared/device';

export const getSettings = privateProcedure({
  schema: withZodSchema({ schema: getSettingsSchema }),
})({
  handler: async (_input, { db }) => {
    const [profile, prefs, rows, avatars] = await Promise.all([
      db.from('profiles').select('*').maybeSingle(),
      db.from('notification_preferences').select('*').maybeSingle(),
      db
        .from('expenses')
        .select('device_id, device_name, device_type')
        .not('device_id', 'is', null)
        .order('date', { ascending: false }),
      loadAvatars(db),
    ]);
    if (profile.error) throw new InternalServer(profile.error);
    if (prefs.error) throw new InternalServer(prefs.error);
    if (rows.error) throw new InternalServer(rows.error);

    // One entry per device, named by its most recent expense.
    const devices = new Map<string, NonNullable<ReturnType<typeof toDevice>>>();
    for (const row of rows.data) {
      const device = toDevice(row, avatars);
      if (device && !devices.has(device.id)) devices.set(device.id, device);
    }

    return {
      code: 200 as const,
      data: {
        profile: {
          name: profile.data?.name ?? '',
          email: profile.data?.email ?? '',
        },
        notifications: {
          push: prefs.data?.push ?? true,
          email: prefs.data?.email ?? false,
          limitWarnings: prefs.data?.limit_warnings ?? true,
          receiptConfirmations: prefs.data?.receipt_confirmations ?? true,
          limitAlerts: prefs.data?.limit_alerts ?? true,
        },
        devices: [...devices.values()],
      },
    };
  },
});
