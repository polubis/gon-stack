import { listTimeSchema } from '@schemas/time';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { readAllPages } from '../../shared/paged';
import { loadProfiles } from '../../shared/device';
import {
  materializeTimeRecurring,
  notifyUnfinishedTasks,
  toTimeBacklogTask,
  toTimeTask,
} from '../../shared/time';

export const listTime = privateProcedure({
  schema: withZodSchema({ schema: listTimeSchema }),
})({
  handler: async (input, { db, user }) => {
    await materializeTimeRecurring(db, user.id, input.to);
    if (input.tz) await notifyUnfinishedTasks(db, user.id, input.tz);
    const profiles = await loadProfiles(db);
    const [categories, priorities, tasks, backlog] = await Promise.all([
      readAllPages((from, to, total) => {
        const query = db.from('time_categories').select('*').order('name');
        return (total ? query.order('id') : query).range(from, to);
      }),
      readAllPages((from, to, total) => {
        const query = db.from('time_priorities').select('*').order('value');
        return (total ? query.order('id') : query).range(from, to);
      }),
      readAllPages((from, to, total) => {
        const query = db
          .from('time_tasks')
          .select('*')
          .gte('day', input.from)
          .lte('day', input.to)
          .order('day')
          .order('at', { nullsFirst: false });
        return (total ? query.order('id') : query).range(from, to);
      }),
      readAllPages((from, to) =>
        db
          .from('time_tasks')
          .select('*')
          .is('day', null)
          .order('created_at')
          .order('id')
          .range(from, to),
      ),
    ]);

    return {
      code: 200 as const,
      data: {
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          color: c.color,
        })),
        priorities: priorities.map((p) => ({
          id: p.id,
          name: p.name,
          value: p.value,
        })),
        tasks: tasks.map((row) => toTimeTask(row, profiles)),
        backlog: backlog.map((row) => toTimeBacklogTask(row, profiles)),
      },
    };
  },
});
