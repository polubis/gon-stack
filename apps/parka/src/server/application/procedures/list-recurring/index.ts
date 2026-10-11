import { listRecurringSchema } from '@schemas/recurring';
import { todayDay } from '@/shared/period/period';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { materializeRecurring, toRule } from '../../shared/recurring';

export const listRecurring = privateProcedure({
  schema: withZodSchema({ schema: listRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    // Without the caller's zone "today" is a guess: do not charge early.
    if (input.tz) await materializeRecurring(db, user.id, todayDay(input.tz));

    const { data, error } = await db.from('recurring_expenses').select('*');
    if (error) throw new InternalServer(error);

    return { code: 200 as const, data: data.map(toRule) };
  },
});
