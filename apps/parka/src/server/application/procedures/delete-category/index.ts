import { deleteCategorySchema } from '@schemas/categories';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  categorySnapshot,
  tryRecordNotifications,
} from '../../shared/notifications';

export const deleteCategory = privateProcedure({
  schema: withZodSchema({ schema: deleteCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('categories')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Category not found');

    const [deleted] = data;
    if (deleted) {
      await tryRecordNotifications(db, user.id, [
        {
          kind: 'category-deleted',
          payload: { category: categorySnapshot(deleted) },
        },
      ]);
    }

    return { code: 200 as const, ok: true as const };
  },
});
