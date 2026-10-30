import { listRecurringSchema } from '@schemas/recurring';
import { todayDay } from '@/shared/period/period';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { readRecurring } from '../../shared/finance-reads';
import { materializeRecurring } from '../../shared/recurring';

export const listRecurring = privateProcedure({
  schema: withZodSchema({ schema: listRecurringSchema }),
})({
  handler: async (input, { db, user }) => {
    // Without the caller's zone "today" is a guess: do not charge early.
    if (input.tz) await materializeRecurring(db, user.id, todayDay(input.tz));

    return { code: 200 as const, data: await readRecurring(db) };
  },
});
