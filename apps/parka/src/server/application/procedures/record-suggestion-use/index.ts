import { recordSuggestionUseSchema } from '@schemas/suggestions';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const recordSuggestionUse = privateProcedure({
  schema: withZodSchema({ schema: recordSuggestionUseSchema }),
})({
  handler: async (input, { db }) => {
    const { error } = await db.rpc('record_field_use', {
      p_field: input.field,
      p_value: input.value,
    });
    if (error) throw fromSupabaseError(error);

    return { code: 200 as const, ok: true as const };
  },
});
