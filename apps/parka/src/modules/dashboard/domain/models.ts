import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type Month = Brand<string, 'Month'>;
export type { Period, PeriodKind } from '@/shared/period/period';
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
export type ReceiptItemId = Brand<string, 'ReceiptItemId'>;
export type LimitId = Brand<string, 'LimitId'>;
export type RecurringId = Brand<string, 'RecurringId'>;

/** One bucket of the spending chart: a day, or a month when a year is shown. */
export type SeriesPoint = { index: number; total: number };

export type CategorySlice = {
  id: CategoryId;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type Summary = {
  userName: string;
  /** Selected period total. */
  total: number;
  /** Selected period vs the one before it, in percent. */
  change: number;
  previousTotal: number;
  transactions: number;
  /** Selected period total per elapsed day. */
  dailyAverage: number;
  /** Per-bucket totals of the selected period, first bucket first. */
  series: SeriesPoint[];
  /** Per-bucket totals of the previous period, first bucket first. */
  previousSeries: SeriesPoint[];
  /** Total monthly limit, `null` when none is set. */
  monthlyLimit: number | null;
  /** Breakdown of the selected period. */
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
  /** `null` when its products come from different categories. */
  categoryId: CategoryId | null;
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

export type NoticeBody =
  | { tone: 'success'; message: string }
  | {
      tone: 'error';
      title: string;
      code: string;
      description: string;
      /** Re-runs the failed action. */
      retry?: () => void;
    };

export type Notice = { id: number } & NoticeBody;

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

export type ProgressTone = 'brand' | 'warn' | 'danger';

export type TotalProgress = { spent: number; amount: number; pct: number };

export type CategoryProgress = TotalProgress & {
  id: LimitId;
  categoryId: CategoryId;
  alertAt80: boolean;
};

/** Everything the dashboard shows, loaded together: all or nothing. */
export type DashboardData = {
  summary: Summary;
  expenses: Expense[];
  categories: Category[];
  limits: Limit[];
  recurring: Recurring[];
};
