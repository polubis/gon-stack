import type { Brand } from '@repo/type-beast/brand';

export type ExpenseId = Brand<string, 'ExpenseId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ReceiptItemId = Brand<string, 'ReceiptItemId'>;
export type NotificationId = Brand<string, 'NotificationId'>;

import type { CategoryIconId } from '@/shared/ui/category-icon-ids';

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

export type Draft = {
  merchant: string;
  /** `YYYY-MM-DD`. */
  date: string;
  items: ReceiptItem[];
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
  source: 'receipt';
  items: ReceiptItem[];
};

export type NewNotification = {
  id: NotificationId;
  kind: 'receipt-confirmation';
  title: string;
  body: string;
  ageDays: 0;
};

export type NewReceipt = {
  expense: NewExpense;
  notification: NewNotification;
};

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
