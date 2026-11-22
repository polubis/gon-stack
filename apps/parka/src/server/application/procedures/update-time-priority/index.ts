import { updateTimePrioritySchema } from '@schemas/time';
import { NotFound } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateTimePriority = privateProcedure({
  schema: withZodSchema({ schema: updateTimePrioritySchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_priorities')
      .update({ name: input.name, value: input.value })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();
    if (error) throw fromSupabaseError(error);
    if (!data) throw new NotFound(undefined, 'Priority not found');

    return {
      code: 200 as const,
      data: { id: data.id, name: data.name, value: data.value },
    };
  },
});
