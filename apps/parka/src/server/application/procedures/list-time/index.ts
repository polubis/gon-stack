import { listTimeSchema } from '@schemas/time';
import { InternalServer } from '../../core/error-handling';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
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
      db.from('time_categories').select('*').order('name'),
      db.from('time_priorities').select('*').order('value'),
      db
        .from('time_tasks')
        .select('*')
        .gte('day', input.from)
        .lte('day', input.to)
        .order('day')
        .order('at', { nullsFirst: false }),
      db
        .from('time_tasks')
        .select('*')
        .is('day', null)
        .order('created_at')
        .order('id'),
    ]);
    if (categories.error) throw new InternalServer(categories.error);
    if (priorities.error) throw new InternalServer(priorities.error);
    if (tasks.error) throw new InternalServer(tasks.error);
    if (backlog.error) throw new InternalServer(backlog.error);

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
        tasks: tasks.data.map((row) => toTimeTask(row, profiles)),
        backlog: backlog.data.map((row) => toTimeBacklogTask(row, profiles)),
      },
    };
  },
});
