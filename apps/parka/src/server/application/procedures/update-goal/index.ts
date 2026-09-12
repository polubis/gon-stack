import { updateGoalSchema } from '@schemas/goals';
import { InternalServer, NotFound } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const updateGoal = privateProcedure({
  schema: withZodSchema({ schema: updateGoalSchema }),
})({
  handler: async (input, { db }) => {
    const { data, error } = await db
      .from('savings_goals')
      .update({
        name: input.name,
        target: input.target,
        saved: input.saved,
        months: input.months,
      })
      .eq('id', input.id)
      .select()
      .maybeSingle();
    if (error) throw new InternalServer(error.message);
    if (!data) throw new NotFound('Goal not found');

    return {
      code: 200 as const,
      data: {
        id: data.id,
        name: data.name,
        target: Number(data.target),
        saved: Number(data.saved),
        months: Number(data.months),
      },
    };
  },
});
