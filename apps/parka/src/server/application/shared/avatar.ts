import type { z } from 'zod';
import type { avatar } from '@schemas/avatar';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { AVATAR_SIZES } from '@/shared/avatar/domain/rules';

type Avatar = z.infer<ReturnType<typeof avatar>>;

export const AVATAR_BUCKET = 'avatars';

export const avatarPath = (userId: string, size: number) =>
  `${userId}/${size}.webp`;

/** Public URLs of every variant; `updatedAt` busts caches after a replace. */
export const toAvatar = (
  db: SupabaseServer,
  userId: string,
  updatedAt: string,
): Avatar => ({
  variants: AVATAR_SIZES.map((size) => ({
    size,
    url: `${db.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath(userId, size)).data.publicUrl}?v=${Date.parse(updatedAt)}`,
  })),
});
