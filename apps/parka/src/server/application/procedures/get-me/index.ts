import { schema } from '@schemas/auth-me';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

const text = (value: unknown) =>
  typeof value === 'string' && value ? value : null;

export const getMe = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.auth.getUser();
    const user = error ? null : data.user;
    const meta = user?.user_metadata ?? {};

    return {
      code: 200 as const,
      user: user
        ? {
            id: user.id,
            email: user.email ?? '',
            displayName: text(meta.full_name) ?? text(meta.name),
            avatarUrl: text(meta.avatar_url) ?? text(meta.picture),
          }
        : null,
    };
  },
});
