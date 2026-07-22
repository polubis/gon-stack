import { schema } from '@schemas/save-user-profile-answers';
import { privateProcedure } from '../../core/procedure';
import { withZodSchema } from '../../adapter/zod';

export const saveUserProfileAnswers = privateProcedure({
  schema: withZodSchema({ schema }),
})({
  handler: async () => ({
    code: 200,
    ok: true as const,
  }),
});
