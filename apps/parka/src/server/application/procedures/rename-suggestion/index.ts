import { renameSuggestionSchema } from '@schemas/suggestions';
import { Conflict, NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

const UNIQUE_VIOLATION = '23505';

export const renameSuggestion = privateProcedure({
  schema: withZodSchema({ schema: renameSuggestionSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('field_suggestions')
      .update({ value: input.newValue })
      .eq('field', input.field)
      .eq('value_key', input.value.trim().toLowerCase())
      .select('field');
    if (error) {
      if (error.code === UNIQUE_VIOLATION)
        throw new Conflict(error, 'Value already exists');
      throw fromSupabaseError(error);
    }
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Value not found');

    return { code: 200 as const, ok: true as const };
  },
});
