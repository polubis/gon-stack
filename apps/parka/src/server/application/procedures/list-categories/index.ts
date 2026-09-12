import { listCategoriesSchema } from '@schemas/categories';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const listCategories = privateProcedure({
  schema: withZodSchema({ schema: listCategoriesSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.from('categories').select('*');
    if (error) throw new InternalServer(error.message);

    return {
      code: 200 as const,
      data: data.map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
      })),
    };
  },
});
