import { listLimitsSchema } from '@schemas/limits';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const listLimits = privateProcedure({
  schema: withZodSchema({ schema: listLimitsSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.from('limits').select('*');
    if (error) throw fromSupabaseError(error);

    return {
      code: 200 as const,
      data: data.map((l) => ({
        id: l.id,
        scope: l.scope as 'total' | 'category',
        categoryId: l.category_id ?? undefined,
        amount: Number(l.amount),
        alertAt: l.alert_at,
      })),
    };
  },
});
