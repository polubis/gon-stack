import { getAvatarSchema } from '@schemas/avatar';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toAvatar } from '../../shared/avatar';

export const getAvatar = privateProcedure({
  schema: withZodSchema({ schema: getAvatarSchema }),
})({
  handler: async (_input, { db, user }) => {
    const { data, error } = await db
      .from('profile_avatars')
      .select('updated_at')
      .maybeSingle();
    if (error) throw new InternalServer(error);

    return {
      code: 200 as const,
      data: data ? toAvatar(db, user.id, data.updated_at) : null,
    };
  },
});
