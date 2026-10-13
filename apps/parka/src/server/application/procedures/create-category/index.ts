import { createCategorySchema } from '@schemas/categories';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  categorySnapshot,
  tryRecordNotifications,
} from '../../shared/notifications';

export const createCategory = privateProcedure({
  schema: withZodSchema({ schema: createCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('categories')
      .insert({
        user_id: user.id,
        id: input.id,
        name: input.name,
        icon: input.icon,
        color: input.color,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error);

    await tryRecordNotifications(db, user.id, [
      {
        kind: 'category-created',
        payload: { category: categorySnapshot(data) },
      },
    ]);

    return {
      code: 201 as const,
      data: {
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
      },
    };
  },
});
