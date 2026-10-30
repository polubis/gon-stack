import { listCategoriesSchema } from '@schemas/categories';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { readCategories } from '../../shared/finance-reads';

export const listCategories = privateProcedure({
  schema: withZodSchema({ schema: listCategoriesSchema }),
})({
  handler: async (_input, { db }) => ({
    code: 200 as const,
    data: await readCategories(db),
  }),
});
