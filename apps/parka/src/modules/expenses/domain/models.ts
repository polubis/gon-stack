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
  id: string;
  name: string;
  icon: CategoryIconId;
  color: string;
};

export type ReceiptItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  categoryId: string;
};

export type Expense = {
  id: string;
  merchant: string;
  /** ISO date-time string. */
  date: string;
  amount: number;
  categoryId: string;
  paymentMethod: string;
  isBill: boolean;
  source: 'receipt' | 'manual';
  items: ReceiptItem[];
};

export type Filter = 'all' | 'category' | 'bills';
