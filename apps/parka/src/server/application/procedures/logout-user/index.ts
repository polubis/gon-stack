import { schema } from '@schemas/logout-user';
import { APP_ROUTER } from '@/shared/router/routes';
import { logger } from '../../core/logger';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const logoutUser = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ userId, all }, { db, sessions }) => {
    const targets = all
      ? sessions.list().map((account) => account.userId)
      : [userId ?? sessions.activeId()].flatMap((id) => (id ? [id] : []));
    const original = sessions.activeId();

    for (const target of targets) {
      if (!sessions.has(target)) continue;
      // Supabase signs out whatever is active, so aim it at the target first.
      sessions.activate(target);
      const { error } = await db.auth.signOut();
      // Revoking is best effort: the cookies go either way.
      if (error) logger(error, 'warn');
      sessions.forget(target);
    }

    if (original && !targets.includes(original) && sessions.has(original)) {
      sessions.activate(original);
    }

    return {
      code: 200 as const,
      location:
        sessions.list().length > 0
          ? APP_ROUTER.dashboard()
          : APP_ROUTER.signIn(),
    };
  },
});
