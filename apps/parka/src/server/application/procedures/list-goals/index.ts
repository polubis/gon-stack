import { listGoalsSchema } from '@schemas/goals';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';

export const listGoals = privateProcedure({
  schema: withZodSchema({ schema: listGoalsSchema }),
})({
  handler: async (_input, { db }) => {
    const { data, error } = await db.from('savings_goals').select('*');
    if (error) throw new InternalServer(error.message);

    return {
      code: 200 as const,
      data: data.map((g) => ({
        id: g.id,
        name: g.name,
        target: Number(g.target),
        saved: Number(g.saved),
        months: Number(g.months),
      })),
    };
  },
});
