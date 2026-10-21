import type { TaskId } from '../domain/models';

/** URL ids of the time modals (see `shared/router/modal-stack`). */
export const NEW_TASK_MODAL = 'task-new';

export const BACKLOG_MODAL = 'backlog';
export const NEW_BACKLOG_MODAL = 'backlog-new';

export const NEW_CATEGORY_MODAL = 'category-new';
export const NEW_PRIORITY_MODAL = 'priority-new';
export const CATEGORIES_MODAL = 'categories';

const NEW_TASK_ON_PREFIX = 'task-new:';
const EDIT_BACKLOG_PREFIX = 'backlog-edit:';
const EDIT_PREFIX = 'task-edit:';
const DELETE_PREFIX = 'task-delete:';
const STOP_SERIES_PREFIX = 'series-stop:';

/** Add-task form with the day already filled in. */
export const newTaskOnModal = (day: string): string =>
  `${NEW_TASK_ON_PREFIX}${day}`;

export const newTaskDayOf = (modal: string): string | null =>
  modal.startsWith(NEW_TASK_ON_PREFIX)
    ? modal.slice(NEW_TASK_ON_PREFIX.length)
    : null;

export const editTaskModal = (id: TaskId): string => `${EDIT_PREFIX}${id}`;

export const deleteTaskModal = (id: TaskId): string => `${DELETE_PREFIX}${id}`;

export const stopSeriesModal = (id: TaskId): string =>
  `${STOP_SERIES_PREFIX}${id}`;

export const editBacklogModal = (id: TaskId): string =>
  `${EDIT_BACKLOG_PREFIX}${id}`;

export const editedBacklogIdOf = (modal: string): TaskId | null =>
  modal.startsWith(EDIT_BACKLOG_PREFIX)
    ? (modal.slice(EDIT_BACKLOG_PREFIX.length) as TaskId)
    : null;

export const editedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(EDIT_PREFIX)
    ? (modal.slice(EDIT_PREFIX.length) as TaskId)
    : null;

export const deletedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(DELETE_PREFIX)
    ? (modal.slice(DELETE_PREFIX.length) as TaskId)
    : null;

export const stoppedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(STOP_SERIES_PREFIX)
    ? (modal.slice(STOP_SERIES_PREFIX.length) as TaskId)
    : null;
