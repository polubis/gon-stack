import { createLimitSchema } from '@schemas/limits';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { fromSupabaseError } from '../../adapter/supabase';

export const createLimit = privateProcedure({
  schema: withZodSchema({ schema: createLimitSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('limits')
      .insert({
        user_id: user.id,
        id: input.id,
        scope: input.scope,
        category_id: input.categoryId ?? null,
        amount: input.amount,
        alert_at: input.alertAt,
      })
      .select()
      .single();
    if (error) throw fromSupabaseError(error);

    return {
      code: 201 as const,
      data: {
        id: data.id,
        scope: data.scope as 'total' | 'category',
        categoryId: data.category_id ?? undefined,
        amount: Number(data.amount),
        alertAt: data.alert_at,
      },
    };
  },
});
