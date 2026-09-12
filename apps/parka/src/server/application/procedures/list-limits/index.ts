import { listLimitsSchema } from '@schemas/limits';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const listLimits = privateProcedure({
  schema: withZodSchema({ schema: listLimitsSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.from('limits').select('*');
    if (error) throw new InternalServer(error.message);

    return {
      code: 200 as const,
      data: data.map((l) => ({
        id: l.id,
        scope: l.scope as 'total' | 'category',
        categoryId: l.category_id ?? undefined,
        amount: Number(l.amount),
        alertAt80: l.alert_at80,
        delivery: l.delivery as 'push' | 'email',
      })),
    };
  },
});
