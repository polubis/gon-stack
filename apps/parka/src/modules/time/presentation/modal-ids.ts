import type { TaskId } from '../domain/models';

/** URL ids of the time modals (see `shared/router/modal-stack`). */
export const NEW_TASK_MODAL = 'task-new';

export const NEW_CATEGORY_MODAL = 'category-new';
export const NEW_PRIORITY_MODAL = 'priority-new';
export const CATEGORIES_MODAL = 'categories';

const EDIT_PREFIX = 'task-edit:';
const DELETE_PREFIX = 'task-delete:';

export const editTaskModal = (id: TaskId): string => `${EDIT_PREFIX}${id}`;

export const deleteTaskModal = (id: TaskId): string => `${DELETE_PREFIX}${id}`;

export const editedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(EDIT_PREFIX)
    ? (modal.slice(EDIT_PREFIX.length) as TaskId)
    : null;

export const deletedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(DELETE_PREFIX)
    ? (modal.slice(DELETE_PREFIX.length) as TaskId)
    : null;
