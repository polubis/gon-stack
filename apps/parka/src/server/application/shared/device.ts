import type { z } from 'zod';
import type { device } from '@schemas/general';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { DEVICE_AVATAR_IDS } from '@/shared/device/domain/avatars';
import { toDevicePhoto, type DevicePhoto } from './device-photo';

type Device = z.infer<ReturnType<typeof device>>;

type DeviceColumns = {
  device_id: string | null;
  device_name: string | null;
  device_type: string | null;
  device_model?: string | null;
  device_os?: string | null;
  device_browser?: string | null;
  device_screen?: string | null;
};

export const deviceColumns = (value: Device | null) => ({
  device_id: value?.id ?? null,
  device_name: value?.name ?? null,
  device_type: value?.type ?? null,
  device_model: value?.model ?? null,
  device_os: value?.os ?? null,
  device_browser: value?.browser ?? null,
  device_screen: value?.screen ?? null,
});

/** What the user set per device id, as stored in `device_profiles`. */
export type DeviceProfile = {
  avatar: string | null;
  customName: string | null;
  photo: DevicePhoto | null;
};
export type ProfilesByDevice = ReadonlyMap<string, DeviceProfile>;

export const toDevice = (
  row: DeviceColumns,
  profiles: ProfilesByDevice = new Map(),
): Device | null =>
  row.device_id && row.device_name && isDeviceType(row.device_type)
    ? {
        id: row.device_id,
        name: row.device_name,
        type: row.device_type,
        avatar: toAvatar(profiles.get(row.device_id)?.avatar),
        model: row.device_model ?? null,
        os: row.device_os ?? null,
        browser: row.device_browser ?? null,
        screen: row.device_screen ?? null,
        customName: profiles.get(row.device_id)?.customName ?? null,
        photo: profiles.get(row.device_id)?.photo ?? null,
      }
    : null;

/** The user's profiles; reading never fails an expense, so errors give none. */
export const loadProfiles = async (
  db: SupabaseServer,
): Promise<ProfilesByDevice> => {
  const { data } = await db
    .from('device_profiles')
    .select('user_id, device_id, avatar, custom_name, photo_updated_at');
  return new Map(
    (data ?? []).map((r) => [
      r.device_id,
      {
        avatar: r.avatar,
        customName: r.custom_name,
        photo: r.photo_updated_at
          ? toDevicePhoto(db, r.user_id, r.device_id, r.photo_updated_at)
          : null,
      },
    ]),
  );
};

const toAvatar = (value: string | null | undefined): Device['avatar'] =>
  DEVICE_AVATAR_IDS.find((id) => id === value) ?? null;

const isDeviceType = (value: string | null): value is Device['type'] =>
  value === 'mobile' || value === 'desktop' || value === 'tablet';
