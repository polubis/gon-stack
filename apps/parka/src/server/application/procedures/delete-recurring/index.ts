import { deleteRecurringSchema } from '@schemas/recurring';
import { NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';
import { deleteSeries } from '../../shared/recurring-scope';

/**
 * Without `occurrenceDate` removes the rule; its expenses stay as ordinary
 * ones (FK sets null). With it, `scope` says which occurrences of the series,
 * counted from that one, are removed together with their expenses.
 */
export const deleteRecurring = privateProcedure({
  schema: withZodSchema({ schema: deleteRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    if (input.occurrenceDate !== undefined) {
      const { data: found, error: foundError } = await db
        .from('recurring_expenses')
        .select('id')
        .eq('id', input.id)
        .maybeSingle();
      if (foundError) throw fromSupabaseError(foundError);
      if (!found) throw new NotFound(undefined, 'Recurring expense not found');
      await deleteSeries(
        db,
        user.id,
        input.id,
        input.occurrenceDate,
        input.scope,
      );
      return { code: 200 as const, ok: true as const };
    }
    const { data, error } = await db
      .from('recurring_expenses')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw fromSupabaseError(error);
    if (!data || data.length === 0)
      throw new NotFound(undefined, 'Recurring expense not found');

    return { code: 200 as const, ok: true as const };
  },
});
