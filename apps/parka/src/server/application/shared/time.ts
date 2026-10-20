import type { Database } from '@/shared/data-sources/db-schema';

type TaskRow = Database['public']['Tables']['time_tasks']['Row'];

/** Postgres `time` comes back as `HH:MM:SS`; the contract carries `HH:MM`. */
export const toTimeTask = (row: TaskRow) => ({
  id: row.id,
  title: row.title,
  categoryId: row.category_id,
  priorityId: row.priority_id,
  day: row.day,
  at: row.at === null ? null : row.at.slice(0, 5),
  done: row.done,
});
