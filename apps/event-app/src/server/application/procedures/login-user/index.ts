import type { Provider } from '@supabase/supabase-js';
import { schema } from '@schemas/login-user';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const loginUser = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (input, { db }) => {
    if ('provider' in input) {
      const oauthResult = await db.auth.signInWithOAuth({
        provider: input.provider as Provider,
        options: {
          redirectTo: import.meta.env.AUTH_CALLBACK_URL,
          queryParams: { prompt: 'select_account' },
        },
      });

      if (oauthResult.error || !oauthResult.data.url) {
        throw new InternalServer(oauthResult.error?.message);
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
      throw new InternalServer(signInResult.error.message);
    }

    return {
      code: 303,
      location: '/',
    };
  },
});
