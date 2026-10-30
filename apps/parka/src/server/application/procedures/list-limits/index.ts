import { listLimitsSchema } from '@schemas/limits';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { readLimits } from '../../shared/finance-reads';

export const listLimits = privateProcedure({
  schema: withZodSchema({ schema: listLimitsSchema }),
})({
  handler: async (_input, { db }) => ({
    code: 200 as const,
    data: await readLimits(db),
  }),
});
