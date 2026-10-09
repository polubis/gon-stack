import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

export type Month = Brand<string, 'Month'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ExpenseId = Brand<string, 'ExpenseId'>;
export type RecurringId = Brand<string, 'RecurringId'>;
export type ProductId = Brand<string, 'ProductId'>;

export type { CategoryIconId };

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type ExpenseKind = 'normal' | 'recurring';

export type Product = {
  id: ProductId;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: CategoryId;
};

/** What a scanned receipt yields; still to be reviewed and saved by the user. */
export type ReceiptDraft = {
  merchant: string;
  /** ISO date-time string. */
  date: string;
  amount: number;
  paymentMethod: string | null;
  items: Omit<Product, 'id' | 'categoryId'>[];
};

export type NewExpense = {
  id: ExpenseId;
  merchant: string;
  /** ISO date-time string. */
  date: string;
  amount: number;
  categoryId: CategoryId;
  paymentMethod: string;
  isBill: false;
  source: 'receipt' | 'manual';
  items: Product[];
};

export type NewRecurring = {
  id: RecurringId;
  name: string;
  cost: number;
  /** ISO date-time string. */
  nextPaymentDate: string;
  active: true;
  paymentMethod: string;
  categoryId: CategoryId;
  history: [];
};

/** A receipt photo being read, or the reason it could not be. */
export type ScanState =
  | { status: 'idle' }
  | { status: 'scanning' }
  | {
      status: 'failed';
      message: string;
      /** The photo to read again; `null` when it was rejected up front. */
      file: File | null;
    };

/** A finished scan; `id` changes with every scan so the form restarts from it. */
export type ScannedReceipt = { id: number; draft: ReceiptDraft };

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
