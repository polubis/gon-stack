import type { Brand } from '@repo/type-beast/brand';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import type { Device } from '@/shared/device/domain/models';
import type { RecurringInterval } from '@/shared/recurring/occurrences';

export type { RecurringInterval };

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
  /** `null` when the products come from different categories. */
  categoryId: CategoryId | null;
  paymentMethod: string;
  isBill: false;
  source: 'receipt' | 'manual';
  /** Where it was created; kept as is when edited. */
  device: Device | null;
  items: Product[];
};

/** An expense as stored: what the edit page loads and saves. */
export type StoredExpense = Omit<NewExpense, 'isBill' | 'source'> & {
  isBill: boolean;
  source: 'receipt' | 'manual';
  /** Rule that created it; `null` for an ordinary expense. Kept as is when edited. */
  recurringId: RecurringId | null;
  /** `YYYY-MM-DD` the rule's series put it on. Kept as is when edited. */
  occurrenceDate: string | null;
};

/** A rule: an instruction that makes expenses once their day has passed. */
export type NewRecurring = {
  id: RecurringId;
  name: string;
  cost: number;
  interval: RecurringInterval;
  /** `YYYY-MM-DD`: first payment. */
  startDate: string;
  /** `YYYY-MM-DD`: last day a payment may fall on; `null` = open ended. */
  endDate: string | null;
  active: true;
  paymentMethod: string;
  /** `null` when the products come from different categories. */
  categoryId: CategoryId | null;
  /** Copied into every expense the rule makes; `cost` is their total. */
  items: Product[];
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
