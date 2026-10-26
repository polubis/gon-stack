import type { CategoryId, TaskId } from '../domain/models';

/** URL ids of the time modals (see `shared/router/modal-stack`). */
export const NEW_TASK_MODAL = 'task-new';
export const NEW_RECURRING_TASK_MODAL = 'task-new-recurring';

export const BACKLOG_MODAL = 'backlog';
export const NEW_BACKLOG_MODAL = 'backlog-new';

/** Fullscreen editor of a task description, stacked over the task form. */
export const DESCRIPTION_EDITOR_MODAL = 'description-editor';

export const NEW_CATEGORY_MODAL = 'category-new';
export const NEW_PRIORITY_MODAL = 'priority-new';
export const CATEGORIES_MODAL = 'categories';

const EDIT_CATEGORY_PREFIX = 'category-edit:';
const DELETE_CATEGORY_PREFIX = 'category-delete:';
const NEW_TASK_ON_PREFIX = 'task-new:';
const EDIT_BACKLOG_PREFIX = 'backlog-edit:';
const EDIT_PREFIX = 'task-edit:';
const DELETE_PREFIX = 'task-delete:';
const STOP_SERIES_PREFIX = 'series-stop:';
const VIEW_PREFIX = 'task-view:';
const DESCRIPTION_PREFIX = 'task-description:';

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

/** Read-only details of a task or backlog task. */
export const viewTaskModal = (id: TaskId): string => `${VIEW_PREFIX}${id}`;

export const viewedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(VIEW_PREFIX)
    ? (modal.slice(VIEW_PREFIX.length) as TaskId)
    : null;

/** Whole description of a task, scrollable. */
export const descriptionModal = (id: TaskId): string =>
  `${DESCRIPTION_PREFIX}${id}`;

export const describedIdOf = (modal: string): TaskId | null =>
  modal.startsWith(DESCRIPTION_PREFIX)
    ? (modal.slice(DESCRIPTION_PREFIX.length) as TaskId)
    : null;

export const editCategoryModal = (id: CategoryId): string =>
  `${EDIT_CATEGORY_PREFIX}${id}`;

export const editedCategoryIdOf = (modal: string): CategoryId | null =>
  modal.startsWith(EDIT_CATEGORY_PREFIX)
    ? (modal.slice(EDIT_CATEGORY_PREFIX.length) as CategoryId)
    : null;

export const deleteCategoryModal = (id: CategoryId): string =>
  `${DELETE_CATEGORY_PREFIX}${id}`;

export const deletedCategoryIdOf = (modal: string): CategoryId | null =>
  modal.startsWith(DELETE_CATEGORY_PREFIX)
    ? (modal.slice(DELETE_CATEGORY_PREFIX.length) as CategoryId)
    : null;

const DELETE_ATTACHMENT_PREFIX = 'attachment-delete:';

export const deleteAttachmentModal = (id: string): string =>
  `${DELETE_ATTACHMENT_PREFIX}${id}`;

export const deletedAttachmentIdOf = (modal: string): string | null =>
  modal.startsWith(DELETE_ATTACHMENT_PREFIX)
    ? modal.slice(DELETE_ATTACHMENT_PREFIX.length)
    : null;

const VIEW_ATTACHMENT_PREFIX = 'attachment-view:';

/** Full-screen view of an image attachment. */
export const viewAttachmentModal = (id: string): string =>
  `${VIEW_ATTACHMENT_PREFIX}${id}`;

export const viewedAttachmentIdOf = (modal: string): string | null =>
  modal.startsWith(VIEW_ATTACHMENT_PREFIX)
    ? modal.slice(VIEW_ATTACHMENT_PREFIX.length)
    : null;
