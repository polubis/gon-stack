import { deleteCategorySchema } from '@schemas/categories';
import { InternalServer, NotFound } from '../../core/error-handling';
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
    if (error) throw new InternalServer(error.message);
    if (!data || data.length === 0) throw new NotFound('Category not found');

    return { code: 200 as const, ok: true as const };
  },
});
