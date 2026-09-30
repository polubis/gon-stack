import type { Brand } from '@repo/type-beast/brand';

export type LimitId = Brand<string, 'LimitId'>;
export type GoalId = Brand<string, 'GoalId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
/** `YYYY-MM`. */
export type Month = Brand<string, 'Month'>;

import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type { CategoryIconId };

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type Delivery = 'push' | 'email';

export type Limit =
  | {
      id: LimitId;
      scope: 'total';
      amount: number;
      alertAt80: boolean;
      delivery: Delivery;
    }
  | {
      id: LimitId;
      scope: 'category';
      categoryId: CategoryId;
      amount: number;
      alertAt80: boolean;
      delivery: Delivery;
    };

export type CategoryLimit = Extract<Limit, { scope: 'category' }>;

export type Goal = {
  id: GoalId;
  name: string;
  target: number;
  saved: number;
  months: number;
};

/** Only the fields progress needs. */
export type Expense = {
  id: ExpenseId;
  /** ISO date-time string. */
  date: string;
  amount: number;
  categoryId: CategoryId;
};

export type Tab = 'total' | 'category' | 'goals';

export type ProgressTone = 'brand' | 'warn' | 'danger';

export type TotalProgress = { spent: number; amount: number; pct: number };

export type CategoryProgress = TotalProgress & {
  categoryId: CategoryId;
  alertAt80: boolean;
};

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
