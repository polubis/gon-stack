import type { z } from 'zod';
import type {
  createTimeBacklogTaskSchema,
  createTimeCategorySchema,
  updateTimeBacklogTaskSchema,
  updateTimeCategorySchema,
  createTimePrioritySchema,
  createTimeRecurringSchema,
  createTimeTaskSchema,
  deleteTimeCategorySchema,
  deleteTimeRecurringSchema,
  deleteTimeTaskSchema,
  listTimeSchema,
  saveTimeStatusesSchema,
  sendTimeTaskToBacklogSchema,
  updateTimeTaskSchema,
} from '@schemas/time';
import { browserTimeZone } from '@/shared/date/date';
import { API_ROUTER } from '@/shared/router/routes';
import { createRequestCache } from '@/shared/request-cache/request-cache';
import type {
  BacklogTask,
  Category,
  CategoryId,
  Priority,
  Recurring,
  RecurringId,
  Status,
  Task,
  TaskId,
} from '../domain/models';
import {
  toBacklogTask,
  toCategory,
  toPriority,
  toStatus,
  toTask,
} from './mappers';

type Out<T extends () => z.ZodType<{ out: unknown }>> = z.infer<
  ReturnType<T>
>['out'];

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export type TimeData = {
  categories: Category[];
  priorities: Priority[];
  statuses: Status[];
  tasks: Task[];
  backlog: BacklogTask[];
};

const cache = createRequestCache();

/** Reads are shared and kept briefly; any write drops them, also when it ends. */
const send = async (...args: Parameters<typeof fetch>) => {
  cache.clear();
  try {
    return await fetch(...args);
  } finally {
    cache.clear();
  }
};

/** A freshly opened module never starts from reads another module outdated. */
export const resetTimeReads = () => cache.clear();

/** Every task with a day, rules materialized up to `until`. */
const readTime = async (until: string): Promise<TimeData> => {
  const response = await fetch(
    API_ROUTER.time({ to: until, tz: browserTimeZone() }),
    { headers: { Accept: 'application/json' } },
  );
  const json = (await response.json()) as Out<typeof listTimeSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return {
    categories: json.data.categories.map(toCategory),
    priorities: json.data.priorities.map(toPriority),
    statuses: json.data.statuses.map(toStatus),
    tasks: json.data.tasks.map(toTask),
    backlog: json.data.backlog.map(toBacklogTask),
  };
};

/** Nothing else in this module reads. */
export const fetchTime = (until: string): Promise<TimeData> =>
  cache.read(until, () => readTime(until));

export const postTask = async (task: Task): Promise<Task> => {
  const response = await send(API_ROUTER.timeTasks(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  const json = (await response.json()) as Out<typeof createTimeTaskSchema>;
  if (json.code !== 201) throw new Error(json.message);
  return toTask(json.data);
};

export const postBacklogTask = async (
  task: BacklogTask,
): Promise<BacklogTask> => {
  const response = await send(API_ROUTER.timeBacklog(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  const json = (await response.json()) as Out<
    typeof createTimeBacklogTaskSchema
  >;
  if (json.code !== 201) throw new Error(json.message);
  return toBacklogTask(json.data);
};

export const putBacklogTask = async (
  task: BacklogTask,
): Promise<BacklogTask> => {
  const response = await send(API_ROUTER.timeBacklogById(task.id), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  const json = (await response.json()) as Out<
    typeof updateTimeBacklogTaskSchema
  >;
  if (json.code !== 200) throw new Error(json.message);
  return toBacklogTask(json.data);
};

/** Takes a task off the board: it keeps its id, loses its day and hour. */
export const postTaskToBacklog = async (id: TaskId): Promise<BacklogTask> => {
  const response = await send(API_ROUTER.timeBacklogById(id), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ id }),
  });
  const json = (await response.json()) as Out<
    typeof sendTimeTaskToBacklogSchema
  >;
  if (json.code !== 200) throw new Error(json.message);
  return toBacklogTask(json.data);
};

export const putTask = async (task: Task): Promise<Task> => {
  const response = await send(API_ROUTER.timeTaskById(task.id), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(task),
  });
  const json = (await response.json()) as Out<typeof updateTimeTaskSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return toTask(json.data);
};

export const removeTask = async (id: TaskId): Promise<void> => {
  const response = await send(API_ROUTER.timeTaskById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as Out<typeof deleteTimeTaskSchema>;
  if (json.code !== 200) throw new Error(json.message);
};

export const postCategory = async (category: Category): Promise<Category> => {
  const response = await send(API_ROUTER.timeCategories(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(category),
  });
  const json = (await response.json()) as Out<typeof createTimeCategorySchema>;
  if (json.code !== 201) throw new Error(json.message);
  return toCategory(json.data);
};

export const putCategory = async (category: Category): Promise<Category> => {
  const response = await send(API_ROUTER.timeCategoryById(category.id), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(category),
  });
  const json = (await response.json()) as Out<typeof updateTimeCategorySchema>;
  if (json.code !== 200) throw new Error(json.message);
  return toCategory(json.data);
};

export class CategoryInUseError extends Error {}

export const removeCategory = async (id: CategoryId): Promise<void> => {
  const response = await send(API_ROUTER.timeCategoryById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as Out<typeof deleteTimeCategorySchema>;
  if (json.code === 409) throw new CategoryInUseError(json.message);
  if (json.code !== 200) throw new Error(json.message);
};

export const postPriority = async (priority: Priority): Promise<Priority> => {
  const response = await send(API_ROUTER.timePriorities(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(priority),
  });
  const json = (await response.json()) as Out<typeof createTimePrioritySchema>;
  if (json.code !== 201) throw new Error(json.message);
  return toPriority(json.data);
};

/** Replaces the whole ordered list of steps. */
export const putStatuses = async (statuses: Status[]): Promise<Status[]> => {
  const response = await send(API_ROUTER.timeStatuses(), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ statuses }),
  });
  const json = (await response.json()) as Out<typeof saveTimeStatusesSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return json.data.statuses.map(toStatus);
};

export const postRecurring = async (recurring: Recurring): Promise<void> => {
  const response = await send(API_ROUTER.timeRecurring(), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(recurring),
  });
  const json = (await response.json()) as Out<typeof createTimeRecurringSchema>;
  if (json.code !== 201) throw new Error(json.message);
};

export const removeRecurring = async (id: RecurringId): Promise<void> => {
  const response = await send(API_ROUTER.timeRecurringById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as Out<typeof deleteTimeRecurringSchema>;
  if (json.code !== 200) throw new Error(json.message);
};
