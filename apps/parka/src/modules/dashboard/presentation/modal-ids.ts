import type { ExpenseId } from '../domain/models';

/** URL ids of the dashboard modals (see `shared/router/modal-stack`). */
export const CATEGORIES_MODAL = 'categories';
export const EXPENSES_MODAL = 'expenses';
export const PERIOD_RANGE_MODAL = 'period-range';

const EXPENSE_PREFIX = 'expense:';

export const expenseModal = (id: ExpenseId): string => `${EXPENSE_PREFIX}${id}`;

export const expenseOfModal = (modal: string): ExpenseId | null =>
  modal.startsWith(EXPENSE_PREFIX)
    ? (modal.slice(EXPENSE_PREFIX.length) as ExpenseId)
    : null;

const DELETE_PREFIX = 'delete:';

/** Confirmation stacked over the popup of `id` (an expense or a projection). */
export const deleteModal = (id: ExpenseId): string => `${DELETE_PREFIX}${id}`;
