import type { Brand } from '@repo/type-beast/brand';

export type ExpenseId = Brand<string, 'ExpenseId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type ReceiptItemId = Brand<string, 'ReceiptItemId'>;

export type CategoryIconId =
  | 'cart'
  | 'car'
  | 'receipt'
  | 'popcorn'
  | 'heart'
  | 'dumbbell'
  | 'home'
  | 'gift'
  | 'sparkles';

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

export type Filter = 'all' | 'category' | 'bills';

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
