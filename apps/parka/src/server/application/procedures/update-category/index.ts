import { updateCategorySchema } from '@schemas/categories';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateCategory = privateProcedure({
  schema: withZodSchema({ schema: updateCategorySchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('categories')
      .update({ name: input.name, icon: input.icon, color: input.color })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw new InternalServer(error.message);
    if (!data) throw new NotFound('Category not found');

    return {
      code: 200 as const,
      data: {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
      },
    };
  },
});
