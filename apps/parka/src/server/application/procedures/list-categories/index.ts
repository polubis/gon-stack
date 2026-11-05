import { listCategoriesSchema } from '@schemas/categories';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const listCategories = privateProcedure({
  schema: withZodSchema({ schema: listCategoriesSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.from('categories').select('*');
    if (error) throw fromSupabaseError(error);

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
