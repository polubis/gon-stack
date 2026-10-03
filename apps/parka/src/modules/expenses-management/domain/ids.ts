import type { ExpenseId, ProductId, RecurringId } from './models';

const randomPart = (): string => crypto.randomUUID();

export const newExpenseId = (): ExpenseId =>
  `expense-${randomPart()}` as ExpenseId;

export const newRecurringId = (): RecurringId =>
  `recurring-${randomPart()}` as RecurringId;

export const newProductId = (): ProductId =>
  `item-${randomPart()}` as ProductId;
