import type { z } from 'zod';
import type { device } from '@schemas/general';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { DEVICE_AVATAR_IDS } from '@/shared/device/domain/avatars';

type Device = z.infer<ReturnType<typeof device>>;

type DeviceColumns = {
  device_id: string | null;
  device_name: string | null;
  device_type: string | null;
};

export const deviceColumns = (value: Device | null): DeviceColumns => ({
  device_id: value?.id ?? null,
  device_name: value?.name ?? null,
  device_type: value?.type ?? null,
});

/** Avatar chosen per device id, as stored in `device_avatars`. */
export type AvatarsByDevice = ReadonlyMap<string, string>;

export const toDevice = (
  row: DeviceColumns,
  avatars: AvatarsByDevice = new Map(),
): Device | null =>
  row.device_id && row.device_name && isDeviceType(row.device_type)
    ? {
        id: row.device_id,
        name: row.device_name,
        type: row.device_type,
        avatar: toAvatar(avatars.get(row.device_id)),
      }
    : null;

/** The user's avatars; reading never fails an expense, so errors give none. */
export const loadAvatars = async (
  db: SupabaseServer,
): Promise<AvatarsByDevice> => {
  const { data } = await db.from('device_avatars').select('device_id, avatar');
  return new Map((data ?? []).map((r) => [r.device_id, r.avatar]));
};

const toAvatar = (value: string | undefined): Device['avatar'] =>
  DEVICE_AVATAR_IDS.find((id) => id === value) ?? null;

const isDeviceType = (value: string | null): value is Device['type'] =>
  value === 'mobile' || value === 'desktop' || value === 'tablet';
