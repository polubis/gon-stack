import { createTimeRecurringSchema } from '@schemas/time';
import { BadRequest } from '../../core/error-handling';
import { fromSupabaseError } from '../../adapter/supabase';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toTimeRecurring } from '../../shared/time';

/** `last_materialized_date` belongs to the server and is never taken from the request. */
export const createTimeRecurring = privateProcedure({
  schema: withZodSchema({ schema: createTimeRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('time_recurring')
      .insert({
        user_id: user.id,
        id: input.id,
        title: input.title,
        category_id: input.categoryId,
        priority_id: input.priorityId,
        at: input.at,
        interval: input.interval,
        start_date: input.startDate,
        end_date: input.endDate,
        active: input.active,
      })
      .select()
      .single();
    if (error?.code === '23503')
      throw new BadRequest(error, 'Unknown category or priority');
    if (error) throw fromSupabaseError(error);

    return { code: 201 as const, data: toTimeRecurring(data) };
  },
});
