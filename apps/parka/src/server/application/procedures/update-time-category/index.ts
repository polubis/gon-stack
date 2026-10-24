import { updateTimeCategorySchema } from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateTimeCategory = privateProcedure({
  schema: withZodSchema({ schema: updateTimeCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_categories')
      .update({ name: input.name, icon: input.icon, color: input.color })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Category not found');

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
