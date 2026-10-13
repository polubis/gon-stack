import { env } from 'cloudflare:workers';
import { uploadDevicePhotoSchema } from '@schemas/avatar';
import { BadRequest, InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  buildAvatarVariants,
  type ImagesBinding,
} from '../../shared/avatar-image';
import {
  DEVICE_PHOTO_BUCKET,
  devicePhotoPath,
  toDevicePhoto,
} from '../../shared/device-photo';

export const uploadDevicePhoto = privateProcedure({
  schema: withZodSchema({ schema: uploadDevicePhotoSchema }),
})({
  handler: async ({ deviceId, file }, { db, user }) => {
    // Only a device the user made an expense from can get a photo.
    const owned = await db
      .from('expenses')
      .select('device_id')
      .eq('device_id', deviceId)
      .limit(1);
    if (owned.error) throw new InternalServer(owned.error);
    if (owned.data.length === 0) throw new BadRequest(null, 'Unknown device');

    const variants = await buildAvatarVariants(
      env.IMAGES as ImagesBinding,
      file,
    );

    const bucket = db.storage.from(DEVICE_PHOTO_BUCKET);
    for (const { size, bytes } of variants) {
      const { error } = await bucket.upload(
        devicePhotoPath(user.id, deviceId, size),
        bytes,
        { contentType: 'image/webp', upsert: true },
      );
      if (error) throw new InternalServer(error);
    }

    const { data, error } = await db
      .from('device_profiles')
      .upsert({
        user_id: user.id,
        device_id: deviceId,
        photo_updated_at: new Date().toISOString(),
      })
      .select('photo_updated_at')
      .single();
    if (error) throw new InternalServer(error);

    return {
      code: 200 as const,
      data: toDevicePhoto(
        db,
        user.id,
        deviceId,
        data.photo_updated_at ?? new Date().toISOString(),
      ),
    };
  },
});
