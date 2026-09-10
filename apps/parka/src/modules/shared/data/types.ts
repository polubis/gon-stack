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

export type Limit = {
  id: string;
  scope: 'total' | 'category';
  categoryId?: string;
  amount: number;
  alertAt80: boolean;
  delivery: 'push' | 'email';
};

export type SavingsGoal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  months: number;
};

export type Recurring = {
  id: string;
  name: string;
  cost: number;
  nextPaymentDate: string;
  active: boolean;
  paymentMethod: string;
  categoryId: string;
  history: { date: string; amount: number }[];
};

export type NotificationKind =
  'limit-warning' | 'receipt-confirmation' | 'limit-alert' | 'recurring';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  ageDays: number;
};

export type Settings = {
  profile: { name: string; email: string };
  notifications: {
    push: boolean;
    email: boolean;
    limitWarnings: boolean;
    receiptConfirmations: boolean;
    limitAlerts: boolean;
  };
};

export type ParkaState = {
  /** Selected calendar month as `YYYY-MM`. */
  selectedMonth: string;
  authed: boolean;
  categories: Category[];
  expenses: Expense[];
  limits: Limit[];
  goals: SavingsGoal[];
  recurring: Recurring[];
  notifications: AppNotification[];
  settings: Settings;
};
