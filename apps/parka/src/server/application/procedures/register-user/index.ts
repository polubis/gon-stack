import { schema } from '@schemas/register-user';
import { apiRoutes, routes } from '@/shared/router';
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
        emailRedirectTo: `${origin}${apiRoutes.authConfirm()}`,
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
      location: routes.dashboard(),
    };
  },
});
