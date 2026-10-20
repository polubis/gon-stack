/** URL ids of the time modals (see `shared/router/modal-stack`). */
export const NEW_TASK_MODAL = 'task-new';

export const NEW_CATEGORY_MODAL = 'category-new';
export const NEW_PRIORITY_MODAL = 'priority-new';
export const CATEGORIES_MODAL = 'categories';

const EDIT_PREFIX = 'task-edit:';

export const editTaskModal = (title: string): string =>
  `${EDIT_PREFIX}${title}`;

export const editedTitleOf = (modal: string): string | null =>
  modal.startsWith(EDIT_PREFIX) ? modal.slice(EDIT_PREFIX.length) : null;
