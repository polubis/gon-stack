import { createTimeCategorySchema } from '@schemas/time';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createTimeCategory = privateProcedure({
  schema: withZodSchema({ schema: createTimeCategorySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_categories')
      .upsert(
        {
          user_id: user.id,
          id: input.id,
          name: input.name,
          icon: input.icon,
          color: input.color,
        },
        { onConflict: 'user_id,id' },
      )
      .select()
      .single();
    if (error) throw fromSupabaseError(error);

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
