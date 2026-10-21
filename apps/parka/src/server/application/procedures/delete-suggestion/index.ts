import { deleteSuggestionSchema } from '@schemas/suggestions';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteSuggestion = privateProcedure({
  schema: withZodSchema({ schema: deleteSuggestionSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('field_suggestions')
      .delete()
      .eq('field', input.field)
      .eq('value_key', input.value.trim().toLowerCase())
      .select('field');
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Value not found');

    return { code: 200 as const, ok: true as const };
  },
});
