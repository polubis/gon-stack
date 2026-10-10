import type { Brand } from '@repo/type-beast/brand';

export type ExpenseId = Brand<string, 'ExpenseId'>;
export type CategoryId = Brand<string, 'CategoryId'>;

export type Format = 'csv' | 'pdf';

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
  paymentMethod: string;
};

export type ExportFile = {
  name: string;
  type: string;
  content: string;
};
