import {
  Bell,
  ReceiptText,
  TriangleAlert,
  Repeat,
  type LucideIcon,
} from 'lucide-react';
import { AppShell, Card, ScreenHeader } from '@/modules/shared/ui';
import { useParkaState, type NotificationKind } from '@/modules/shared/data';

const ICON: Record<NotificationKind, LucideIcon> = {
  'limit-warning': TriangleAlert,
  'receipt-confirmation': ReceiptText,
  'limit-alert': Bell,
  recurring: Repeat,
};

const ageLabel = (days: number) =>
  days === 0 ? 'dziś' : days === 1 ? '1 dzień temu' : `${days} dni temu`;

export const Main = () => {
  const state = useParkaState();

  return (
    <AppShell e2e="notifications:main" nav="more">
      <ScreenHeader title="Powiadomienia" backHref="/settings/" />
      <main className="flex flex-1 flex-col gap-2 px-4 pb-6 pt-2">
        <ul className="space-y-2" data-e2e="notifications:list">
          {state.notifications.map((n) => {
            const Icon = ICON[n.kind] ?? Bell;
            return (
              <Card as="li" key={n.id} className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-ink-soft">{n.body}</p>
                </div>
                <span className="text-xs text-ink-soft">
                  {ageLabel(n.ageDays)}
                </span>
              </Card>
            );
          })}
          {state.notifications.length === 0 ? (
            <li className="text-sm text-ink-soft">Brak powiadomień.</li>
          ) : null}
        </ul>
      </main>
    </AppShell>
  );
};
