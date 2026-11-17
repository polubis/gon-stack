import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import {
  inScope,
  previousOccurrence,
  type RecurringScope,
} from '@/shared/recurring/occurrences';
import { fromSupabaseError } from '../adapter/supabase';
import { TASK_ATTACHMENT_BUCKET, taskAttachmentPath } from './task-attachment';
import { toTimeRecurring } from './time';

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

/** Edits the series: the tasks it reaches, and the rule that makes the following ones. */
export const editTaskSeries = async (
  db: SupabaseServer,
  userId: string,
  ruleId: string,
  ids: string[],
  scope: RecurringScope,
  edit: TaskSeriesEdit,
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
  const { error } = await db
    .from('time_recurring')
    .update({
      title: edit.title,
      description: edit.description,
      category_id: edit.categoryId,
      priority_id: edit.priorityId,
      at: edit.at,
    })
    .eq('user_id', userId)
    .eq('id', ruleId);
  if (error) throw fromSupabaseError(error);
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
