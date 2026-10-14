import type { Provider } from '@supabase/supabase-js';
import { schema } from '@schemas/login-user';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import { MAX_ACCOUNTS } from '@/shared/auth/configuration/constraints';
import { Conflict, InternalServer } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const loginUser = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db, origin, sessions }) => {
    const known = sessions.list();
    const isKnown =
      'email' in input &&
      known.some(({ email }) => email === input.email.trim().toLowerCase());
    if (known.length >= MAX_ACCOUNTS && !isKnown) {
      throw new Conflict(
        undefined,
        `You can be signed in to ${MAX_ACCOUNTS} accounts at most`,
      );
    }

    if ('provider' in input) {
      const oauthResult = await db.auth.signInWithOAuth({
        provider: input.provider as Provider,
        options: {
          redirectTo: `${origin}${API_ROUTER.authCallback()}`,
          queryParams: { prompt: 'select_account' },
        },
      });

      if (oauthResult.error || !oauthResult.data.url) {
        throw new InternalServer(oauthResult.error);
      }

      return {
        code: 303,
        location: oauthResult.data.url,
      };
    }

    const signInResult = await db.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (signInResult.error) {
      throw fromSupabaseError(signInResult.error);
    }

    return {
      code: 303,
      location: APP_ROUTER.dashboard(),
    };
  },
});
