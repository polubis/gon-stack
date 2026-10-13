import type { Brand } from '@repo/type-beast/brand';

export type NotificationId = Brand<string, 'NotificationId'>;

export type ExpenseSnapshot = {
  merchant: string;
  amount: number;
  /** UTC instant, ISO. */
  date: string;
  /** Display name; `null` when products span several categories. */
  category: string | null;
  paymentMethod: string;
  isBill: boolean;
};

export type CategorySnapshot = {
  name: string;
  icon: string;
  color: string;
};

export type RecurringSnapshot = {
  name: string;
  cost: number;
  interval: 'weekly' | 'monthly' | 'yearly';
  category: string | null;
  paymentMethod: string;
};

type Base = {
  id: NotificationId;
  title: string;
  body: string;
  /** UTC instant, ISO. */
  createdAt: string;
  read: boolean;
};

/** One variant per notification type, each with its own payload. */
export type Notification = Base &
  (
    | { kind: 'expense-created'; payload: { expense: ExpenseSnapshot } }
    | {
        kind: 'expense-updated';
        payload: { before: ExpenseSnapshot; after: ExpenseSnapshot };
      }
    | { kind: 'expense-deleted'; payload: { expense: ExpenseSnapshot } }
    | { kind: 'category-created'; payload: { category: CategorySnapshot } }
    | {
        kind: 'category-updated';
        payload: { before: CategorySnapshot; after: CategorySnapshot };
      }
    | { kind: 'category-deleted'; payload: { category: CategorySnapshot } }
    | {
        kind: 'recurring-accrued';
        payload: { rule: RecurringSnapshot; days: string[] };
      }
    /** Rows from before typed payloads: text only, nothing to diff. */
    | { kind: 'other'; payload: null }
  );

export type NotificationKind = Notification['kind'];

/** One labelled value that appeared (`before` null), vanished (`after` null) or changed. */
export type DiffRow = {
  label: string;
  before: string | null;
  after: string | null;
};

export type DiffSegment = {
  kind: 'same' | 'removed' | 'added';
  text: string;
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

export type NotificationsPage = {
  items: Notification[];
  /** Cursor of the next page; `null` on the last one. */
  nextCursor: string | null;
  /** Server-side total of unread notifications, independent of loaded pages. */
  unread: number;
};
