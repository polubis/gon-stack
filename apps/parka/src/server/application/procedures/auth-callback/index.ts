import { schema } from '@schemas/auth-callback';
import { APP_ROUTER } from '@/shared/router/routes';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const authCallback = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ code }, { db }) => {
    const { error } = await db.auth.exchangeCodeForSession(code);

    if (error) {
      throw new InternalServer(error.message);
    }

    return {
      code: 303,
      location: APP_ROUTER.dashboard(),
    };
  },
});
