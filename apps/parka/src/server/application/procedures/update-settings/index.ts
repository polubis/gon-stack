import { updateSettingsSchema } from '@schemas/settings';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

const getOwnDeviceIds = async (db: SupabaseServer): Promise<string[]> => {
  const [expenses, tasks] = await Promise.all([
    db.from('expenses').select('device_id').not('device_id', 'is', null),
    db.from('time_tasks').select('device_id').not('device_id', 'is', null),
  ]);
  if (expenses.error) throw fromSupabaseError(expenses.error);
  if (tasks.error) throw fromSupabaseError(tasks.error);
  return [
    ...new Set(
      [...expenses.data, ...tasks.data].map((r) => r.device_id as string),
    ),
  ];
};

export const updateSettings = privateProcedure({
  schema: withZodSchema({ schema: updateSettingsSchema }),
})({
  handler: async (input, { db, user }) => {
    const uid = user.id;
    // Independent writes and the device ids read share one round trip. The
    // first failure in this order is raised, as when they ran one by one.
    const [profile, prefs, push, owned] = await Promise.all([
      db.from('profiles').upsert({
        user_id: uid,
        name: input.profile.name,
      }),
      db.from('notification_preferences').upsert({
        user_id: uid,
        push: input.notifications.push,
        email: input.notifications.email,
        limit_warnings: input.notifications.limitWarnings,
        receipt_confirmations: input.notifications.receiptConfirmations,
        limit_alerts: input.notifications.limitAlerts,
      }),
      // Push off means no device receives it any more.
      input.notifications.push
        ? { error: null }
        : db.from('push_subscriptions').delete().eq('user_id', uid),
      getOwnDeviceIds(db).then(
        (ids) => ({ ids, failure: null }),
        (failure: unknown) => ({ ids: [] as string[], failure }),
      ),
    ]);
    if (profile.error) throw fromSupabaseError(profile.error);
    if (prefs.error) throw fromSupabaseError(prefs.error);
    if (push.error) throw fromSupabaseError(push.error);
    if (owned.failure) throw owned.failure;

    // Only avatar and custom name are writable; a device the user owns no
    // expense of is ignored.
    const ownedIds = new Set(owned.ids);
    const own = input.devices
      .filter((d) => ownedIds.has(d.id))
      .map((d) => ({
        id: d.id,
        avatar: d.avatar,
        customName: d.customName?.trim() || null,
      }));
    const set = own.filter((d) => d.avatar || d.customName);
    const cleared = own.filter((d) => !d.avatar && !d.customName);

    const writeSet = async () => {
      if (!set.length) return;
      const { error } = await db.from('device_profiles').upsert(
        set.map((d) => ({
          user_id: uid,
          device_id: d.id,
          avatar: d.avatar,
          custom_name: d.customName,
        })),
      );
      if (error) throw fromSupabaseError(error);
    };
    const writeCleared = async () => {
      if (!cleared.length) return;
      // A device with a photo keeps its row; the rest of the profile resets.
      const ids = cleared.map((d) => d.id);
      const reset = await db
        .from('device_profiles')
        .update({ avatar: null, custom_name: null })
        .in('device_id', ids);
      if (reset.error) throw fromSupabaseError(reset.error);
      const { error } = await db
        .from('device_profiles')
        .delete()
        .in('device_id', ids)
        .is('photo_updated_at', null);
      if (error) throw fromSupabaseError(error);
    };
    // Set and cleared touch different device ids, so they overlap.
    await Promise.all([writeSet(), writeCleared()]);

    return { code: 200 as const, data: input };
  },
});
