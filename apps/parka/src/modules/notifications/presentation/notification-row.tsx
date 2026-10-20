import {
  Bell,
  Check,
  CheckCheck,
  ArrowRight,
  FolderPen,
  Hourglass,
  Receipt,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Card } from '@/shared/ui/layout';
import { APP_ROUTER } from '@/shared/router/routes';
import { ageLabel, taskCount } from '../domain/format';
import type { Notification, NotificationKind } from '../domain/models';
import { useContext } from './context';
import { DiffView } from './diff-view';

const ICON: Record<NotificationKind, LucideIcon> = {
  'expense-created': Receipt,
  'expense-updated': Receipt,
  'expense-deleted': Receipt,
  'category-created': FolderPen,
  'category-updated': FolderPen,
  'category-deleted': FolderPen,
  'recurring-accrued': Repeat,
  'time-day-unfinished': Hourglass,
  other: Bell,
};

export const NotificationRow = ({
  notification,
  now,
}: {
  notification: Notification;
  now: number;
}) => {
  const ctx = useContext();
  const Icon = ICON[notification.kind];

  return (
    <Card
      as="li"
      data-e2e={`notifications:row:${notification.id}`}
      className={cn(
        'flex min-w-0 flex-col gap-1',
        notification.read ? 'bg-surface' : 'border-brand',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          {notification.read ? null : (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-danger-strong"
            />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'wrap-anywhere text-sm',
              notification.read ? 'text-ink-soft' : 'font-semibold',
            )}
          >
            {notification.read ? null : (
              <span className="sr-only">Nieprzeczytane: </span>
            )}
            {notification.title}
          </p>
          <p className="wrap-anywhere text-xs text-ink-soft">
            {notification.kind === 'time-day-unfinished'
              ? `Do zrobienia: ${taskCount(notification.payload.tasks.length)}`
              : notification.body}
          </p>
        </div>
        <time
          dateTime={notification.createdAt}
          className="shrink-0 text-xs text-ink-soft"
        >
          {ageLabel(notification.createdAt, now)}
        </time>
      </div>
      <DiffView
        notification={notification}
        aria-label={`Zmiany: ${notification.title}`}
        data-e2e={`notifications:diff:${notification.id}`}
      />
      {notification.kind === 'time-day-unfinished' ? (
        <a
          href={APP_ROUTER.time({ date: notification.payload.day })}
          data-e2e={`notifications:open-tasks:${notification.id}`}
          className="mt-1 inline-flex items-center justify-between gap-2 rounded-xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-softer"
        >
          Przejdź do zadań
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null}
      <div className="flex justify-end pt-1">
        {notification.read ? (
          <span
            data-e2e={`notifications:read:${notification.id}`}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-ink-soft"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Przeczytane
          </span>
        ) : (
          <button
            type="button"
            data-e2e={`notifications:mark-read:${notification.id}`}
            onClick={() => ctx.markRead(notification.id)}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-brand-dark hover:bg-brand-softer"
          >
            <CheckCheck className="h-4 w-4" aria-hidden="true" />
            Oznacz jako przeczytane
          </button>
        )}
      </div>
    </Card>
  );
};
