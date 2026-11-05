import { updateCategorySchema } from '@schemas/categories';
import { NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  categorySnapshot,
  tryRecordNotifications,
} from '../../shared/notifications';
import { fromSupabaseError } from '../../adapter/supabase';

export const updateCategory = privateProcedure({
  schema: withZodSchema({ schema: updateCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data: previous, error: previousError } = await db
      .from('categories')
      .select('*')
      .eq('id', input.id)
      .maybeSingle();
    if (previousError) throw fromSupabaseError(previousError);
    if (!previous) throw new NotFound(undefined, 'Category not found');

    const { data, error } = await db
      .from('categories')
      .update({ name: input.name, icon: input.icon, color: input.color })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Category not found');

    await tryRecordNotifications(db, user.id, [
      {
        kind: 'category-updated',
        payload: {
          before: categorySnapshot(previous),
          after: categorySnapshot(data),
        },
      },
    ]);

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
