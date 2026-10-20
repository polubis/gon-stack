import { listTimeSchema } from '@schemas/time';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { toTimeTask } from '../../shared/time';

export const listTime = privateProcedure({
  schema: withZodSchema({ schema: listTimeSchema }),
})({
  handler: async (input, { db }) => {
    const [categories, priorities, tasks] = await Promise.all([
      db.from('time_categories').select('*').order('name'),
      db.from('time_priorities').select('*').order('value'),
      db
        .from('time_tasks')
        .select('*')
        .gte('day', input.from)
        .lte('day', input.to)
        .order('day')
        .order('at', { nullsFirst: false }),
    ]);
    if (categories.error) throw new InternalServer(categories.error);
    if (priorities.error) throw new InternalServer(priorities.error);
    if (tasks.error) throw new InternalServer(tasks.error);

    return {
      code: 200 as const,
      data: {
        categories: categories.data.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
        })),
        priorities: priorities.data.map((p) => ({
          id: p.id,
          name: p.name,
          value: p.value,
        })),
        tasks: tasks.data.map(toTimeTask),
      },
    };
  },
});
