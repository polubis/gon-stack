import type { Brand } from '@repo/type-beast/brand';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;

export type Range = '1' | '3' | '6' | '12';
export type Tab = 'spending' | 'comparison';

export type Category = {
  id: CategoryId;
  name: string;
  color: string;
};

export type Expense = {
  id: ExpenseId;
  /** ISO date-time string. */
  date: string;
  amount: number;
  categoryId: CategoryId;
};

export type CategorySlice = {
  category: Category;
  amount: number;
  pct: number;
};

export type CategoryChange = {
  category: Category;
  changePct: number;
};

export type TrendPoint = { month: Month; total: number };
