import { createTimePrioritySchema } from '@schemas/time';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createTimePriority = privateProcedure({
  schema: withZodSchema({ schema: createTimePrioritySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_priorities')
      .upsert(
        {
          user_id: user.id,
          id: input.id,
          name: input.name,
          value: input.value,
        },
        { onConflict: 'user_id,id' },
      )
      .select()
      .single();
    if (error) throw fromSupabaseError(error);

    return {
      code: 201 as const,
      data: { id: data.id, name: data.name, value: data.value },
    };
  },
});
