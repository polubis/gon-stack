import { getBootstrapSchema } from '@schemas/bootstrap';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { todayDay } from '@/shared/period/period';
import {
  readCategories,
  readDashboard,
  readExpenses,
  readLimits,
  readRecurring,
} from '../../shared/finance-reads';
import { materializeRecurring } from '../../shared/recurring';

export const getBootstrap = privateProcedure({
  schema: withZodSchema({ schema: getBootstrapSchema }),
})({
  handler: async (input, { db, user }) => {
    // Signed in once, charged once: due occurrences are expenses before any read.
    await materializeRecurring(db, user.id, todayDay(input.tz));

    const [dashboard, expenses, categories, limits, recurring] =
      await Promise.all([
        readDashboard(db, input),
        readExpenses(db),
        readCategories(db),
        readLimits(db),
        readRecurring(db),
      ]);

    return {
      code: 200 as const,
      data: { dashboard, expenses, categories, limits, recurring },
    };
  },
});
