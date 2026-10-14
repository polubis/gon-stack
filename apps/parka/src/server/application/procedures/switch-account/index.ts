import { switchAccountSchema } from '@schemas/auth-accounts';
import { NotFound, Unauthorized } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const switchAccount = publicProcedure({
  schema: withZodSchema({ schema: switchAccountSchema }),
})({
  handler: async ({ userId }, { db, sessions }) => {
    if (!sessions.has(userId)) throw new NotFound(undefined, 'Unknown account');

    sessions.activate(userId);

    // Refreshes the target's tokens when needed; a dead session is dropped.
    const { data, error } = await db.auth.getUser();
    if (error || data.user?.id !== userId) {
      sessions.forget(userId);
      throw new Unauthorized(error, 'Account session expired');
    }

    return { code: 200 as const, activeId: userId };
  },
});
