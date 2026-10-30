import { getDashboardSchema } from '@schemas/dashboard';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { todayDay } from '@/shared/period/period';
import { readDashboard } from '../../shared/finance-reads';
import { materializeRecurring } from '../../shared/recurring';

export const getDashboard = privateProcedure({
  schema: withZodSchema({ schema: getDashboardSchema }),
})({
  handler: async (input, { db, user }) => {
    // Charges that came due are expenses first, then every total counts them.
    await materializeRecurring(db, user.id, todayDay(input.tz));

    return { code: 200 as const, data: await readDashboard(db, input) };
  },
});
