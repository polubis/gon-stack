import type { Database } from '@/shared/data-sources/db-schema';
import { localDay, localHour } from '@/shared/date/date';
import { dueOccurrences } from '@/shared/recurring/occurrences';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { InternalServer } from '../core/error-handling';
import { logger } from '../core/logger';
import { toDevice, type ProfilesByDevice } from './device';
import { recordNotificationOnce } from './notifications';

type TaskRow = Database['public']['Tables']['time_tasks']['Row'];
type RuleRow = Database['public']['Tables']['time_recurring']['Row'];

/** Postgres `time` comes back as `HH:MM:SS`; the contract carries `HH:MM`. */
const toHourMinute = (value: string | null): string | null =>
  value === null ? null : value.slice(0, 5);

const toInterval = (value: string): 'weekly' | 'monthly' | 'yearly' =>
  value === 'monthly' || value === 'yearly' ? value : 'weekly';

export const toTimeBacklogTask = (
  row: TaskRow,
  profiles?: ProfilesByDevice,
) => ({
  id: row.id,
  key: row.key,
  title: row.title,
  description: row.description,
  categoryId: row.category_id,
  priorityId: row.priority_id,
  device: toDevice(row, profiles),
});

export const toTimeTask = (row: TaskRow, profiles?: ProfilesByDevice) => ({
  id: row.id,
  key: row.key,
  title: row.title,
  description: row.description,
  categoryId: row.category_id,
  priorityId: row.priority_id,
  // Only tasks of the board are mapped; the backlog has its own shape.
  day: row.day ?? '',
  at: toHourMinute(row.at),
  done: row.done,
  inProgress: row.in_progress,
  device: toDevice(row, profiles),
  recurringId: row.recurring_id,
  occurrenceDate: row.occurrence_date,
});

export const toTimeRecurring = (row: RuleRow) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  categoryId: row.category_id,
  priorityId: row.priority_id,
  at: toHourMinute(row.at),
  interval: toInterval(row.interval),
  startDate: row.start_date,
  endDate: row.end_date,
  active: row.active,
  lastMaterializedDate: row.last_materialized_date,
});

/**
 * Turns every occurrence of every rule up to `until` (end of the viewed
 * range) into an ordinary task. Safe to repeat and to run in parallel: the
 * unique (rule, occurrence) key makes a second insert a no-op, and
 * `last_materialized_date` only moves forward, so a deleted task stays gone.
 */
export const materializeTimeRecurring = async (
  db: SupabaseServer,
  userId: string,
  until: string,
): Promise<void> => {
  const { data: rows, error } = await db
    .from('time_recurring')
    .select('*')
    .eq('active', true);
  if (error) throw new InternalServer(error);

  for (const row of rows) {
    const due = dueOccurrences(toTimeRecurring(row), until);
    const newest = due.at(-1);
    if (newest === undefined) continue;

    const { error: insertError } = await db.from('time_tasks').upsert(
      due.map((day) => ({
        user_id: userId,
        id: `${row.id}:${day}`,
        title: row.title,
        description: row.description,
        category_id: row.category_id,
        priority_id: row.priority_id,
        day,
        at: row.at,
        done: false,
        recurring_id: row.id,
        occurrence_date: day,
      })),
      {
        onConflict: 'user_id,recurring_id,occurrence_date',
        ignoreDuplicates: true,
      },
    );
    if (insertError) throw new InternalServer(insertError);

    // Only forward: a slower parallel request must not roll the mark back.
    const { error: markError } = await db
      .from('time_recurring')
      .update({ last_materialized_date: newest })
      .eq('id', row.id)
      .or(`last_materialized_date.is.null,last_materialized_date.lt.${newest}`);
    if (markError) throw new InternalServer(markError);
  }
};

/** From this local hour on, the day counts as nearly over. */
export const END_OF_DAY_HOUR = 20;

/**
 * Near the end of the caller's day, warns once about tasks of that day still
 * not done. The notification id is the day, so any number of requests (or
 * parallel ones) leave exactly one. Never fails the read it piggybacks on.
 */
export const notifyUnfinishedTasks = async (
  db: SupabaseServer,
  userId: string,
  timeZone: string,
  now: Date = new Date(),
): Promise<void> => {
  if (localHour(now, timeZone) < END_OF_DAY_HOUR) return;
  try {
    const day = localDay(now, timeZone);
    const { data, error } = await db
      .from('time_tasks')
      .select('title, at')
      .eq('day', day)
      .eq('done', false)
      .order('at', { nullsFirst: true });
    if (error) throw new InternalServer(error);
    if (data.length === 0) return;
    const { count, error: countError } = await db
      .from('time_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('done', false)
      .lte('day', day);
    if (countError) throw new InternalServer(countError);
    await recordNotificationOnce(db, userId, `time-day-unfinished:${day}`, {
      kind: 'time-day-unfinished',
      payload: {
        day,
        totalOpen: Math.max(count ?? 0, data.length),
        tasks: data.map((row) => ({
          title: row.title,
          at: toHourMinute(row.at),
        })),
      },
    });
  } catch (error) {
    logger(error, 'error');
  }
};
