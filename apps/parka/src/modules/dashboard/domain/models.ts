import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
export type ReceiptItemId = Brand<string, 'ReceiptItemId'>;

export type Range = '1' | '3' | '6' | '12';

export type TrendPoint = { month: Month; total: number };

export type CategorySlice = {
  id: CategoryId;
  name: string;
  color: string;
  amount: number;
  pct: number;
};

export type CategoryChange = {
  id: CategoryId;
  name: string;
  color: string;
  changePct: number;
};

export type Summary = {
  /** Selected month total. */
  total: number;
  /** Selected month vs previous month, in percent. */
  change: number;
  previousTotal: number;
  /** Total across the selected range. */
  rangeTotal: number;
  trend: TrendPoint[];
  /** Breakdown across the selected range. */
  categories: CategorySlice[];
  /** Biggest category moves, selected month vs previous month. */
  categoryChanges: CategoryChange[];
};

export type QuickActionIconId = 'add' | 'camera' | 'target' | 'repeat';

export type QuickAction = {
  label: string;
  href: string;
  iconId: QuickActionIconId;
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
  source: 'receipt' | 'manual';
  items: ReceiptItem[];
};

export type ExpenseFilter = 'all' | 'category' | 'bills';

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
