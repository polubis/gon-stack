import type { CategoryId, PriorityId, TaskId } from './models';

/** Client-generated ids, valid for the server (`min(1)`). */
export const newTaskId = (): TaskId => `task-${crypto.randomUUID()}` as TaskId;

export const newCategoryId = (): CategoryId =>
  `tcat-${crypto.randomUUID()}` as CategoryId;

export const newPriorityId = (): PriorityId =>
  `tprio-${crypto.randomUUID()}` as PriorityId;
