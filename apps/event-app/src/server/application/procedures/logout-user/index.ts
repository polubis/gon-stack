import { schema } from '@schemas/logout-user';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { publicProcedure } from '../../core/procedure';

export const logoutUser = publicProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (_input, { db }) => {
    const { error } = await db.auth.signOut();

    if (error) {
      throw new InternalServer(error.message);
    }

    return {
      code: 303,
      location: '/',
    };
  },
});
