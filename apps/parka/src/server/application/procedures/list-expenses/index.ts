import { listExpensesSchema } from '@schemas/expenses';
import { todayDay } from '@/shared/period/period';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { readExpenses } from '../../shared/finance-reads';
import { materializeRecurring } from '../../shared/recurring';

export const listExpenses = privateProcedure({
  schema: withZodSchema({ schema: listExpensesSchema }),
})({
  handler: async (input, { db, user }) => {
    // Due recurring charges become expenses on the first read of the day.
    // Without the caller's zone "today" is a guess: do not charge early.
    if (input.tz) await materializeRecurring(db, user.id, todayDay(input.tz));

    return { code: 200 as const, data: await readExpenses(db) };
  },
});
