import { schema } from '@schemas/register-user';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const registerUser = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async ({ email, password }, { db }) => {
    const signUpResult = await db.auth.signUp({
      email,
      password,
    });

    if (signUpResult.error) {
      throw new InternalServer(signUpResult.error.message);
    }

    return {
      code: 303,
      location: '/',
    };
  },
});
