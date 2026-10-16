import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import type { Device } from '@/shared/device/domain/models';
import type { RecurringInterval } from '@/shared/recurring/occurrences';

export type Month = Brand<string, 'Month'>;
export type { Period, PeriodKind } from '@/shared/period/period';
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
export type ReceiptItemId = Brand<string, 'ReceiptItemId'>;
export type LimitId = Brand<string, 'LimitId'>;
export type RecurringId = Brand<string, 'RecurringId'>;
export type RecurringItemId = Brand<string, 'ProductId'>;

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
  source: 'receipt' | 'manual';
  /** Where it was created; `null` for older and recurring expenses. */
  device: Device | null;
  /** Rule that created it; `null` for an ordinary expense. Only a marker: it lives on its own. */
  recurringId: RecurringId | null;
  /** `YYYY-MM-DD` the rule's series put it on; `null` for an ordinary expense. */
  occurrenceDate: string | null;
  items: ReceiptItem[];
};

export type { RecurringInterval } from '@/shared/recurring/occurrences';

export type RecurringItem = {
  id: RecurringItemId;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: CategoryId;
};

/** An instruction, not an expense: it never counts into any total. */
export type Recurring = {
  id: RecurringId;
  name: string;
  cost: number;
  interval: RecurringInterval;
  /** `YYYY-MM-DD`: first occurrence. */
  startDate: string;
  /** `YYYY-MM-DD`: last day an occurrence may fall on; `null` = open ended. */
  endDate: string | null;
  /** `YYYY-MM-DD`: newest occurrence the server turned into an expense. */
  lastMaterializedDate: string | null;
  active: boolean;
  paymentMethod: string;
  /** `null` when the products come from different categories. */
  categoryId: CategoryId | null;
  /** Copied into every expense the rule makes; `cost` is their total. */
  items: RecurringItem[];
};

/** A projected occurrence of a rule: not charged yet, not stored. */
export type Upcoming = {
  /** Popup id; never the id of a stored expense. */
  id: ExpenseId;
  recurring: Recurring;
  /** `YYYY-MM-DD` it will be charged on. */
  date: string;
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
