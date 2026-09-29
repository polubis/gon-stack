import type { Brand } from '@repo/type-beast/brand';

export type RecurringId = Brand<string, 'RecurringId'>;
export type CategoryId = Brand<string, 'CategoryId'>;

export const CATEGORY_ICON_IDS = [
  'cart',
  'car',
  'receipt',
  'popcorn',
  'heart',
  'dumbbell',
  'home',
  'gift',
  'sparkles',
] as const;

export type CategoryIconId = (typeof CATEGORY_ICON_IDS)[number];

export type Category = {
  id: CategoryId;
  name: string;
  icon: CategoryIconId;
  color: string;
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

export type Tab = 'active' | 'all';

export type Notice = {
  id: number;
  tone: 'success' | 'error';
  message: string;
};
