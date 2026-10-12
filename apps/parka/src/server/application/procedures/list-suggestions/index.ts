import { listSuggestionsSchema } from '@schemas/suggestions';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

const MAX_SUGGESTIONS = 500;

export const listSuggestions = privateProcedure({
  schema: withZodSchema({ schema: listSuggestionsSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db
      .from('field_suggestions')
      .select('field, value, use_count, last_used')
      .order('use_count', { ascending: false })
      .order('last_used', { ascending: false, nullsFirst: false })
      .order('value')
      .limit(MAX_SUGGESTIONS);
    if (error) throw new InternalServer(error);

    return {
      code: 200 as const,
      data: data.map((row) => ({
        field: row.field as 'merchant' | 'paymentMethod',
        value: row.value,
        useCount: row.use_count,
        lastUsed: row.last_used,
      })),
    };
  },
});
