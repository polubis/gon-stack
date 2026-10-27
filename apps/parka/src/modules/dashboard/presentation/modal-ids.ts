import type { ExpenseId, LimitId } from '../domain/models';

/** URL ids of the dashboard modals (see `shared/router/modal-stack`). */
export const CATEGORIES_MODAL = 'categories';
export const EXPENSES_MODAL = 'expenses';

const EXPENSE_PREFIX = 'expense:';

export const expenseModal = (id: ExpenseId): string => `${EXPENSE_PREFIX}${id}`;

export const expenseOfModal = (modal: string): ExpenseId | null =>
  modal.startsWith(EXPENSE_PREFIX)
    ? (modal.slice(EXPENSE_PREFIX.length) as ExpenseId)
    : null;

const DELETE_PREFIX = 'delete:';

/** Confirmation stacked over the popup of `id` (an expense or a projection). */
export const deleteModal = (id: ExpenseId): string => `${DELETE_PREFIX}${id}`;

/** Limits are managed in modals, like categories. */
export const LIMITS_MODAL = 'limits';
export const NEW_LIMIT_MODAL = 'limit-new';

const LIMIT_PREFIX = 'limit:';
const LIMIT_DELETE_PREFIX = 'limit-delete:';

/** Editor of the limit `id`, stacked over the limits list. */
export const limitModal = (id: LimitId): string => `${LIMIT_PREFIX}${id}`;

export const limitOfModal = (modal: string): LimitId | null =>
  modal.startsWith(LIMIT_PREFIX)
    ? (modal.slice(LIMIT_PREFIX.length) as LimitId)
    : null;

/** Confirmation stacked over the editor of the limit `id`. */
export const limitDeleteModal = (id: LimitId): string =>
  `${LIMIT_DELETE_PREFIX}${id}`;

export const limitOfDeleteModal = (modal: string): LimitId | null =>
  modal.startsWith(LIMIT_DELETE_PREFIX)
    ? (modal.slice(LIMIT_DELETE_PREFIX.length) as LimitId)
    : null;
