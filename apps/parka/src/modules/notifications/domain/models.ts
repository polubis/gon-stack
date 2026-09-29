import type { Brand } from '@repo/type-beast/brand';

export type NotificationId = Brand<string, 'NotificationId'>;

export type NotificationKind =
  | 'limit-warning'
  | 'receipt-confirmation'
  | 'limit-alert'
  | 'recurring'
  | 'other';

export type Notification = {
  id: NotificationId;
  kind: NotificationKind;
  title: string;
  body: string;
  ageDays: number;
};
