import { getFinanceTourSchema } from '@schemas/finance-tour';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { validOutcome } from '@/server/domain/finance-tour';

export const getFinanceTour = privateProcedure({
  schema: withZodSchema({ schema: getFinanceTourSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db
      .from('finance_tours')
      .select('outcome, expires_at')
      .maybeSingle();
    if (error) throw new InternalServer(error);

    const outcome = validOutcome(data, new Date());

    return {
      code: 200 as const,
      data: { outcome, expiresAt: outcome ? data!.expires_at : null },
    };
  },
});
