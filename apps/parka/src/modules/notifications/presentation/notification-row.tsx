import {
  Bell,
  ReceiptText,
  Repeat,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/shared/ui';
import { ageLabel } from '../domain/format';
import type { Notification, NotificationKind } from '../domain/models';

const ICON: Record<NotificationKind, LucideIcon> = {
  'limit-warning': TriangleAlert,
  'receipt-confirmation': ReceiptText,
  'limit-alert': Bell,
  recurring: Repeat,
  other: Bell,
};

export const NotificationRow = ({
  notification,
}: {
  notification: Notification;
}) => {
  const Icon = ICON[notification.kind];

  return (
    <Card as="li" className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon className="h-4.5 w-4.5" aria-hidden="true" />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">{notification.title}</p>
        <p className="text-xs text-ink-soft">{notification.body}</p>
      </div>
      <span className="text-xs text-ink-soft">
        {ageLabel(notification.ageDays)}
      </span>
    </Card>
  );
};
