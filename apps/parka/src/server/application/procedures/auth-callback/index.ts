import { schema } from '@schemas/auth-callback';
import { APP_ROUTER } from '@/shared/router/routes';

import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const authCallback = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ code }, { db }) => {
    const { error } = await db.auth.exchangeCodeForSession(code);

    if (error) {
      throw fromSupabaseError(error);
    }

    return {
      code: 303,
      location: APP_ROUTER.dashboard(),
    };
  },
});
