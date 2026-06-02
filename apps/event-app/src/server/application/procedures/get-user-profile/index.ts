import { schema } from '@schemas/get-user-profile';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { InternalServer } from '../../core/error-handling';

export const getUserProfile = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async (_input, { db, user }) => {
    const result = await db
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (result.error) {
      throw new InternalServer('Failed to fetch user profile');
    }

    return {
      code: 200,
      data: result.data,
    };
  },
});
