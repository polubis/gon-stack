import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
export type ReceiptItemId = Brand<string, 'ReceiptItemId'>;
export type LimitId = Brand<string, 'LimitId'>;
export type GoalId = Brand<string, 'GoalId'>;
export type RecurringId = Brand<string, 'RecurringId'>;

export type DayPoint = { day: number; total: number };

export type CategorySlice = {
  id: CategoryId;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type Summary = {
  userName: string;
  /** Selected month total. */
  total: number;
  /** Selected month vs previous month, in percent. */
  change: number;
  previousTotal: number;
  transactions: number;
  /** Selected month total per elapsed day. */
  dailyAverage: number;
  previousTransactions: number;
  previousDailyAverage: number;
  /** Per-day totals of the selected month, day 1 first. */
  daily: DayPoint[];
  /** Per-day totals of the previous month, day 1 first. */
  previousDaily: DayPoint[];
  /** Total monthly limit, `null` when none is set. */
  monthlyLimit: number | null;
  /** Breakdown of the selected month. */
  categories: CategorySlice[];
};

export type { CategoryIconId };

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type ReceiptItem = {
  id: ReceiptItemId;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: CategoryId;
};

export type Expense = {
  id: ExpenseId;
  merchant: string;
  /** ISO date-time string. */
  date: string;
  amount: number;
  categoryId: CategoryId;
  paymentMethod: string;
  isBill: boolean;
  /** `recurring`: derived from a recurring expense, never stored. */
  source: 'receipt' | 'manual' | 'recurring';
  items: ReceiptItem[];
};

export type Payment = {
  /** ISO date-time string. */
  date: string;
  amount: number;
};

export type Recurring = {
  id: RecurringId;
  name: string;
  cost: number;
  /** ISO date-time string. */
  nextPaymentDate: string;
  active: boolean;
  paymentMethod: string;
  categoryId: CategoryId;
  history: Payment[];
};

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
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

export type ProgressTone = 'brand' | 'warn' | 'danger';

export type TotalProgress = { spent: number; amount: number; pct: number };

export type CategoryProgress = TotalProgress & {
  id: LimitId;
  categoryId: CategoryId;
  alertAt80: boolean;
};
