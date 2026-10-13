import { env } from 'cloudflare:workers';
import { uploadAvatarSchema } from '@schemas/avatar';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { AVATAR_BUCKET, avatarPath, toAvatar } from '../../shared/avatar';
import {
  buildAvatarVariants,
  type ImagesBinding,
} from '../../shared/avatar-image';

export const uploadAvatar = privateProcedure({
  schema: withZodSchema({ schema: uploadAvatarSchema }),
})({
  handler: async ({ file }, { db, user }) => {
    const variants = await buildAvatarVariants(
      env.IMAGES as ImagesBinding,
      file,
    );

    const bucket = db.storage.from(AVATAR_BUCKET);
    for (const { size, bytes } of variants) {
      const { error } = await bucket.upload(avatarPath(user.id, size), bytes, {
        contentType: 'image/webp',
        upsert: true,
      });
      if (error) throw new InternalServer(error);
    }

    const { data, error } = await db
      .from('profile_avatars')
      .upsert({ user_id: user.id, updated_at: new Date().toISOString() })
      .select('updated_at')
      .single();
    if (error) throw new InternalServer(error);

    return {
      code: 200 as const,
      data: toAvatar(db, user.id, data.updated_at),
    };
  },
});
