import type { Brand } from '@repo/type-beast/brand';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
export type RecurringId = Brand<string, 'RecurringId'>;

export type Category = {
  id: CategoryId;
  name: string;
};

export type Expense = {
  id: ExpenseId;
  merchant: string;
  /** ISO date-time string. */
  date: string;
  amount: number;
  /** `null` when its products come from different categories. */
  categoryId: CategoryId | null;
  /** Every category the expense touches: its own or its products'. */
  categoryIds: CategoryId[];
  isBill: boolean;
};

export type Recurring = {
  id: RecurringId;
  active: boolean;
};

export type ReportSummary = {
  total: number;
  categoryCount: number;
  recurringCount: number;
};
