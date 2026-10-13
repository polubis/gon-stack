import type { z } from 'zod';
import type { device } from '@schemas/general';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { AVATAR_SIZES } from '@/shared/avatar/domain/rules';

export type DevicePhoto = NonNullable<
  z.infer<ReturnType<typeof device>>['photo']
>;

export const DEVICE_PHOTO_BUCKET = 'device-photos';

export const devicePhotoPath = (
  userId: string,
  deviceId: string,
  size: number,
) => `${userId}/${deviceId}/${size}.webp`;

/** Public URLs of every variant; `updatedAt` busts caches after a replace. */
export const toDevicePhoto = (
  db: SupabaseServer,
  userId: string,
  deviceId: string,
  updatedAt: string,
): DevicePhoto => ({
  variants: AVATAR_SIZES.map((size) => ({
    size,
    url: `${db.storage.from(DEVICE_PHOTO_BUCKET).getPublicUrl(devicePhotoPath(userId, deviceId, size)).data.publicUrl}?v=${Date.parse(updatedAt)}`,
  })),
});
