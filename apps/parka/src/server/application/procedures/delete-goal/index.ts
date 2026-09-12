import { deleteGoalSchema } from '@schemas/goals';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const deleteGoal = privateProcedure({
  schema: withZodSchema({ schema: deleteGoalSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('savings_goals')
      .delete()
      .eq('id', input.id)
      .select();
    if (error) throw new InternalServer(error.message);
    if (!data || data.length === 0) throw new NotFound('Goal not found');

    return { code: 200 as const, ok: true as const };
  },
});
