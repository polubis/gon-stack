import { listRecurringSchema } from '@schemas/recurring';
import { todayDay } from '@/shared/period/period';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import {
  loadRuleItems,
  materializeRecurring,
  toRule,
} from '../../shared/recurring';
import { fromSupabaseError } from '../../adapter/supabase';

export const listRecurring = privateProcedure({
  schema: withZodSchema({ schema: listRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    // Without the caller's zone "today" is a guess: do not charge early.
    if (input.tz) await materializeRecurring(db, user.id, todayDay(input.tz));

    const { data, error } = await db.from('recurring_expenses').select('*');
    if (error) throw fromSupabaseError(error);

    const items = await loadRuleItems(db);

    return { code: 200 as const, data: data.map((row) => toRule(row, items)) };
  },
});
