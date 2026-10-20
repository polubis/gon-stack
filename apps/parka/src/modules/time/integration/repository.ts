import type { z } from 'zod';
import type {
  createTimeCategorySchema,
  createTimePrioritySchema,
  createTimeRecurringSchema,
  createTimeTaskSchema,
  deleteTimeRecurringSchema,
  deleteTimeTaskSchema,
  listTimeSchema,
  updateTimeTaskSchema,
} from '@schemas/time';
import { browserTimeZone } from '@/shared/date/date';
import { API_ROUTER } from '@/shared/router/routes';
import type {
  Category,
  Priority,
  Recurring,
  RecurringId,
  Task,
  TaskId,
} from '../domain/models';
import { toCategory, toPriority, toTask } from './mappers';

type Out<T extends () => z.ZodType<{ out: unknown }>> = z.infer<
  ReturnType<T>
>['out'];

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export type TimeData = {
  categories: Category[];
  priorities: Priority[];
  tasks: Task[];
};

/** Nothing else in this module fetches. */
export const fetchTime = async (
  from: string,
  to: string,
  signal: AbortSignal,
): Promise<TimeData> => {
  const response = await fetch(
    API_ROUTER.time({ from, to, tz: browserTimeZone() }),
    {
      headers: { Accept: 'application/json' },
      signal,
    },
  );
  const json = (await response.json()) as Out<typeof listTimeSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return {
    categories: json.data.categories.map(toCategory),
    priorities: json.data.priorities.map(toPriority),
    tasks: json.data.tasks.map(toTask),
  };
};

export const postTask = async (task: Task): Promise<Task> => {
  const response = await fetch(API_ROUTER.timeTasks(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  const json = (await response.json()) as Out<typeof createTimeTaskSchema>;
  if (json.code !== 201) throw new Error(json.message);
  return toTask(json.data);
};

export const putTask = async (task: Task): Promise<Task> => {
  const response = await fetch(API_ROUTER.timeTaskById(task.id), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  const json = (await response.json()) as Out<typeof updateTimeTaskSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return toTask(json.data);
};

export const removeTask = async (id: TaskId): Promise<void> => {
  const response = await fetch(API_ROUTER.timeTaskById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as Out<typeof deleteTimeTaskSchema>;
  if (json.code !== 200) throw new Error(json.message);
};

export const postCategory = async (category: Category): Promise<Category> => {
  const response = await fetch(API_ROUTER.timeCategories(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(category),
  });
  const json = (await response.json()) as Out<typeof createTimeCategorySchema>;
  if (json.code !== 201) throw new Error(json.message);
  return toCategory(json.data);
};

export const postPriority = async (priority: Priority): Promise<Priority> => {
  const response = await fetch(API_ROUTER.timePriorities(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(priority),
  });
  const json = (await response.json()) as Out<typeof createTimePrioritySchema>;
  if (json.code !== 201) throw new Error(json.message);
  return toPriority(json.data);
};

export const postRecurring = async (recurring: Recurring): Promise<void> => {
  const response = await fetch(API_ROUTER.timeRecurring(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(recurring),
  });
  const json = (await response.json()) as Out<typeof createTimeRecurringSchema>;
  if (json.code !== 201) throw new Error(json.message);
};

export const removeRecurring = async (id: RecurringId): Promise<void> => {
  const response = await fetch(API_ROUTER.timeRecurringById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as Out<typeof deleteTimeRecurringSchema>;
  if (json.code !== 200) throw new Error(json.message);
};
