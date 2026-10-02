import { schema } from '@schemas/register-user';
import { API_ROUTER, APP_ROUTER } from '@/shared/router/routes';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const registerUser = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ email, password }, { db, origin }) => {
    const signUpResult = await db.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}${API_ROUTER.authConfirm()}`,
      },
    });

    if (signUpResult.error) {
      throw new InternalServer(signUpResult.error.message);
    }

    if (!signUpResult.data.session) {
      return {
        code: 200,
        ok: true,
      };
    }

    return {
      code: 303,
      location: APP_ROUTER.dashboard(),
    };
  },
});
