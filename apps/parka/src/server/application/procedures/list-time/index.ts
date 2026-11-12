import { listTimeSchema } from '@schemas/time';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles } from '../../shared/device';
import {
  materializeTimeRecurring,
  notifyUnfinishedTasks,
  toTimeBacklogTask,
  toTimeStatuses,
  toTimeTask,
} from '../../shared/time';
import { fromSupabaseError } from '../../adapter/supabase';

export const listTime = privateProcedure({
  schema: withZodSchema({ schema: listTimeSchema }),
})({
  handler: async (input, { db, user }) => {
    await materializeTimeRecurring(db, user.id, input.to);
    if (input.tz) await notifyUnfinishedTasks(db, user.id, input.tz);
    const profiles = await loadProfiles(db);
    const dated = db.from('time_tasks').select('*').not('day', 'is', null);
    const [categories, priorities, statuses, tasks, backlog] =
      await Promise.all([
        db.from('time_categories').select('*').order('name'),
        db.from('time_priorities').select('*').order('value'),
        db.from('time_statuses').select('*').order('position').order('id'),
        (input.from ? dated.gte('day', input.from).lte('day', input.to) : dated)
          .order('day')
          .order('at', { nullsFirst: false }),
        db
          .from('time_tasks')
          .select('*')
          .is('day', null)
          .order('created_at')
          .order('id'),
      ]);
    if (categories.error) throw fromSupabaseError(categories.error);
    if (priorities.error) throw fromSupabaseError(priorities.error);
    if (statuses.error) throw fromSupabaseError(statuses.error);
    if (tasks.error) throw fromSupabaseError(tasks.error);
    if (backlog.error) throw fromSupabaseError(backlog.error);

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
        statuses: toTimeStatuses(statuses.data),
        tasks: tasks.data.map((row) => toTimeTask(row, profiles)),
        backlog: backlog.data.map((row) => toTimeBacklogTask(row, profiles)),
      },
    };
  },
});
