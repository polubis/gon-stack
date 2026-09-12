import { createGoalSchema } from '@schemas/goals';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const createGoal = privateProcedure({
  schema: withZodSchema({ schema: createGoalSchema }),
})({
  handler: async (input, { db, user }) => {
    const { data, error } = await db
      .from('savings_goals')
      .insert({
        user_id: user.id,
        id: input.id,
        name: input.name,
        target: input.target,
        saved: input.saved,
        months: input.months,
      })
      .select()
      .single();
    if (error) throw new InternalServer(error.message);

    return {
      code: 201 as const,
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
