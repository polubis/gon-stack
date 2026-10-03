import type { ExpenseId, LimitId, RecurringId } from './models';

const randomPart = (): string => crypto.randomUUID();

export const newLimitId = (): LimitId => `limit-${randomPart()}` as LimitId;

export const newRecurringId = (): RecurringId =>
  `recurring-${randomPart()}` as RecurringId;

export const newExpenseId = (): ExpenseId =>
  `expense-${randomPart()}` as ExpenseId;
