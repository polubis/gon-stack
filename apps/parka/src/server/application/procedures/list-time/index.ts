import { listTimeSchema } from '@schemas/time';

import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { loadProfiles } from '../../shared/device';
import {
  materializeTimeRecurring,
  notifyUnfinishedTasks,
  toInterval,
  toTimeBacklogTask,
  toTimeStatuses,
  toTimeTask,
} from '../../shared/time';
import { fromSupabaseError } from '../../adapter/supabase';

export const listTime = privateProcedure({
  schema: withZodSchema({ schema: listTimeSchema }),
})({
  handler: async (input, { db, user }) => {
    // Independent reads start at once; only the dated tasks wait for materialization.
    const profilesLoad = loadProfiles(db);
    const refsLoad = Promise.all([
      db.from('time_categories').select('*').order('name'),
      db.from('time_priorities').select('*').order('value'),
      db.from('time_statuses').select('*').order('position').order('id'),
      db
        .from('time_tasks')
        .select('*')
        .is('day', null)
        .order('created_at')
        .order('id'),
      db.from('time_recurring').select('id, interval'),
    ]);
    await materializeTimeRecurring(db, user.id, input.to);
    // The warning never fails and never feeds the answer: it overlaps the dated read.
    const unfinishedCheck = input.tz
      ? notifyUnfinishedTasks(db, user.id, input.tz)
      : undefined;
    const dated = db.from('time_tasks').select('*').not('day', 'is', null);
    const tasks = await (
      input.from ? dated.gte('day', input.from).lte('day', input.to) : dated
    )
      .order('day')
      .order('at', { nullsFirst: false });
    await unfinishedCheck;
    const [[categories, priorities, statuses, backlog, rules], profiles] =
      await Promise.all([refsLoad, profilesLoad]);
    if (categories.error) throw fromSupabaseError(categories.error);
    if (priorities.error) throw fromSupabaseError(priorities.error);
    if (statuses.error) throw fromSupabaseError(statuses.error);
    if (tasks.error) throw fromSupabaseError(tasks.error);
    if (backlog.error) throw fromSupabaseError(backlog.error);
    if (rules.error) throw fromSupabaseError(rules.error);
    const intervals = new Map(
      rules.data.map((rule) => [rule.id, toInterval(rule.interval)]),
    );

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
        tasks: tasks.data.map((row) =>
          toTimeTask(
            row,
            profiles,
            row.recurring_id === null
              ? null
              : (intervals.get(row.recurring_id) ?? null),
          ),
        ),
        backlog: backlog.data.map((row) => toTimeBacklogTask(row, profiles)),
      },
    };
  },
});
