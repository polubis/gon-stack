import { updateSettingsSchema } from '@schemas/settings';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

const getOwnDeviceIds = async (db: SupabaseServer): Promise<string[]> => {
  const { data, error } = await db
    .from('expenses')
    .select('device_id')
    .not('device_id', 'is', null);
  if (error) throw new InternalServer(error);
  return [...new Set(data.map((r) => r.device_id as string))];
};

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
    if (profileError) throw new InternalServer(profileError);

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
    if (prefsError) throw new InternalServer(prefsError);

    // Only avatar and custom name are writable; a device the user owns no
    // expense of is ignored.
    const owned = new Set(await getOwnDeviceIds(db));
    const own = input.devices
      .filter((d) => owned.has(d.id))
      .map((d) => ({
        id: d.id,
        avatar: d.avatar,
        customName: d.customName?.trim() || null,
      }));
    const set = own.filter((d) => d.avatar || d.customName);
    const cleared = own.filter((d) => !d.avatar && !d.customName);

    if (set.length) {
      const { error } = await db.from('device_profiles').upsert(
        set.map((d) => ({
          user_id: uid,
          device_id: d.id,
          avatar: d.avatar,
          custom_name: d.customName,
        })),
      );
      if (error) throw new InternalServer(error);
    }
    if (cleared.length) {
      const { error } = await db
        .from('device_profiles')
        .delete()
        .in(
          'device_id',
          cleared.map((d) => d.id),
        );
      if (error) throw new InternalServer(error);
    }

    return { code: 200 as const, data: input };
  },
});
