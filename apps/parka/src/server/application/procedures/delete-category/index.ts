import { deleteCategorySchema } from '@schemas/categories';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteCategory = privateProcedure({
  schema: withZodSchema({ schema: deleteCategorySchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('categories')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Category not found');

    return { code: 200 as const, ok: true as const };
  },
});
