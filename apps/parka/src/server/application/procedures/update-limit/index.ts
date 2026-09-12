import { updateLimitSchema } from '@schemas/limits';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateLimit = privateProcedure({
  schema: withZodSchema({ schema: updateLimitSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('limits')
      .update({
        scope: input.scope,
        category_id: input.categoryId ?? null,
        amount: input.amount,
        alert_at80: input.alertAt80,
        delivery: input.delivery,
      })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw new InternalServer(error.message);
    if (!data) throw new NotFound('Limit not found');

    return {
      code: 200 as const,
      data: {
        id: data.id,
        scope: data.scope as 'total' | 'category',
        categoryId: data.category_id ?? undefined,
        amount: Number(data.amount),
        alertAt80: data.alert_at80,
        delivery: data.delivery as 'push' | 'email',
      },
    };
  },
});
