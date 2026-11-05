import { deleteLimitSchema } from '@schemas/limits';
import { NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const deleteLimit = privateProcedure({
  schema: withZodSchema({ schema: deleteLimitSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('limits')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Limit not found');

    return { code: 200 as const, ok: true as const };
  },
});
