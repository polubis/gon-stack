import { recordSuggestionUseSchema } from '@schemas/suggestions';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const recordSuggestionUse = privateProcedure({
  schema: withZodSchema({ schema: recordSuggestionUseSchema }),
})({
  handler: async (input, { db }) => {
    const { error } = await db.rpc('record_field_use', {
      p_field: input.field,
      p_value: input.value,
    });
    if (error) throw new InternalServer(error);

    return { code: 200 as const, ok: true as const };
  },
});
