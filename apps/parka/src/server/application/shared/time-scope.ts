import type { Database } from '@/shared/data-sources/db-schema';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import {
  inScope,
  previousOccurrence,
  type RecurringScope,
  type TaskRecurringInterval,
} from '@/shared/recurring/occurrences';
import { fromSupabaseError } from '../adapter/supabase';
import { TASK_ATTACHMENT_BUCKET, taskAttachmentPath } from './task-attachment';
import { toInterval, toTimeRecurring } from './time';

/** What the occurrence edit shares with the other occurrences; each keeps its own day and progress. */
export type TaskSeriesEdit = {
  title: string;
  description: string | null;
  categoryId: string;
  priorityId: string;
  at: string | null;
};

const CHUNK = 100;

const chunks = <T>(list: T[]): T[][] => {
  const parts: T[][] = [];
  for (let i = 0; i < list.length; i += CHUNK)
    parts.push(list.slice(i, i + CHUNK));
  return parts;
};

/** Tasks of the series reached by `scope` from the `anchor` occurrence. */
export const seriesTaskIds = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  scope: RecurringScope,
  anchor: string,
): Promise<string[]> => {
  const { data, error } = await db
    .from('time_tasks')
    .select('id, occurrence_date')
    .eq('user_id', userId)
    .eq('recurring_id', ruleId);
  if (error) throw fromSupabaseError(error);
  return data
    .filter(
      (row) =>
        row.occurrence_date !== null &&
        inScope(scope, row.occurrence_date, anchor),
    )
    .map((row) => row.id);
};

type RuleRow = Database['public']['Tables']['time_recurring']['Row'];

const loadRule = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
): Promise<RuleRow | null> => {
  const { data, error } = await db
    .from('time_recurring')
    .select('*')
    .eq('user_id', userId)
    .eq('id', ruleId)
    .maybeSingle();
  if (error) throw fromSupabaseError(error);
  return data;
};

const updateRule = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  values: Database['public']['Tables']['time_recurring']['Update'],
): Promise<void> => {
  const { error } = await db
    .from('time_recurring')
    .update(values)
    .eq('user_id', userId)
    .eq('id', ruleId);
  if (error) throw fromSupabaseError(error);
};

/**
 * Tasks of the rule after `anchor` that nobody touched yet go: the new days
 * make them again. Done or started ones stay, they hold real progress.
 */
const dropUpcoming = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  anchor: string,
): Promise<void> => {
  const { data, error } = await db
    .from('time_tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('recurring_id', ruleId)
    .gt('occurrence_date', anchor)
    .eq('done', false)
    .eq('in_progress', false);
  if (error) throw fromSupabaseError(error);
  await deleteTimeTasks(
    db,
    userId,
    data.map((row) => row.id),
  );
};

/**
 * Repeats the series at another frequency. Tasks already made are rows of
 * their own, so only what is not made yet follows the new days: the part
 * before the anchor keeps the old frequency, the part `scope` reaches takes
 * the new one, counted from the anchor.
 */
const reschedule = async (
  db: SupabaseServer,
  userId: string,
  row: RuleRow,
  { anchor, taskId }: SeriesAnchor,
  scope: Exclude<RecurringScope, 'this'>,
  edit: TaskSeriesEdit,
  interval: TaskRecurringInterval,
): Promise<void> => {
  const content = {
    title: edit.title,
    description: edit.description,
    category_id: edit.categoryId,
    priority_id: edit.priorityId,
    at: edit.at,
  };
  const previous = previousOccurrence(toTimeRecurring(row), anchor);
  await dropUpcoming(db, userId, row.id, anchor);

  if (scope === 'all' || (scope === 'thisAndFollowing' && previous === null))
    return updateRule(db, userId, row.id, {
      ...content,
      interval,
      last_materialized_date: anchor,
    });

  // A rule that carries on the series from the anchor, with the new frequency.
  const id = crypto.randomUUID();
  const { error } = await db.from('time_recurring').insert({
    ...content,
    user_id: userId,
    id,
    interval,
    start_date: anchor,
    end_date: row.end_date,
    active: row.active,
    last_materialized_date: anchor,
  });
  if (error) throw fromSupabaseError(error);

  if (scope === 'following')
    return updateRule(db, userId, row.id, { end_date: anchor });

  await updateRule(db, userId, row.id, { end_date: previous });
  // The opened task belongs to the part that changed.
  const moved = await db
    .from('time_tasks')
    .update({ recurring_id: id })
    .eq('user_id', userId)
    .eq('id', taskId);
  if (moved.error) throw fromSupabaseError(moved.error);
};

/** The opened occurrence of a series. */
export type SeriesAnchor = { ruleId: string; anchor: string; taskId: string };

/**
 * Edits the series: the tasks it reaches, and the rule that makes the
 * following ones. A different `interval` changes how often it repeats.
 */
export const editTaskSeries = async (
  db: SupabaseServer,
  userId: string,
  { ruleId, anchor, taskId }: SeriesAnchor,
  ids: string[],
  scope: RecurringScope,
  edit: TaskSeriesEdit,
  interval?: TaskRecurringInterval,
): Promise<void> => {
  for (const part of chunks(ids)) {
    const { error } = await db
      .from('time_tasks')
      .update({
        title: edit.title,
        description: edit.description,
        category_id: edit.categoryId,
        priority_id: edit.priorityId,
        at: edit.at,
      })
      .eq('user_id', userId)
      .in('id', part);
    if (error) throw fromSupabaseError(error);
  }
  // Occurrences already made are tasks of their own, so the rule changes in place.
  if (scope === 'this') return;
  const row = await loadRule(db, userId, ruleId);
  if (!row) return;
  if (interval !== undefined && interval !== toInterval(row.interval))
    return reschedule(
      db,
      userId,
      row,
      { ruleId, anchor, taskId },
      scope,
      edit,
      interval,
    );
  await updateRule(db, userId, ruleId, {
    title: edit.title,
    description: edit.description,
    category_id: edit.categoryId,
    priority_id: edit.priorityId,
    at: edit.at,
  });
};

/** Deletes tasks together with their attachment files (rows go with the task, files do not). */
export const deleteTimeTasks = async (
  db: SupabaseServer,
  userId: string,
  ids: string[],
): Promise<void> => {
  for (const part of chunks(ids)) {
    const attachments = await db
      .from('time_task_attachments')
      .select('id')
      .eq('user_id', userId)
      .in('task_id', part);
    if (attachments.error) throw fromSupabaseError(attachments.error);
    if (attachments.data.length > 0) {
      const removed = await db.storage
        .from(TASK_ATTACHMENT_BUCKET)
        .remove(
          attachments.data.map((row) => taskAttachmentPath(userId, row.id)),
        );
      if (removed.error) throw fromSupabaseError(removed.error);
    }
    const { error } = await db
      .from('time_tasks')
      .delete()
      .eq('user_id', userId)
      .in('id', part);
    if (error) throw fromSupabaseError(error);
  }
};

/** Deletes the tasks `scope` reaches and stops the rule making the occurrences it reaches. */
export const deleteTaskSeries = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  anchor: string,
  scope: RecurringScope,
): Promise<void> => {
  await deleteTimeTasks(
    db,
    userId,
    await seriesTaskIds(db, userId, ruleId, scope, anchor),
  );
  if (scope === 'this') return;

  const { data: row, error } = await db
    .from('time_recurring')
    .select('*')
    .eq('user_id', userId)
    .eq('id', ruleId)
    .maybeSingle();
  if (error) throw fromSupabaseError(error);
  if (!row) return;

  // Nothing before the anchor means nothing is left to make: the rule goes.
  const endDate =
    scope === 'all'
      ? null
      : scope === 'following'
        ? anchor
        : previousOccurrence(toTimeRecurring(row), anchor);
  const { error: endError } =
    endDate === null
      ? await db
          .from('time_recurring')
          .delete()
          .eq('user_id', userId)
          .eq('id', ruleId)
      : await db
          .from('time_recurring')
          .update({ end_date: endDate })
          .eq('user_id', userId)
          .eq('id', ruleId);
  if (endError) throw fromSupabaseError(endError);
};
