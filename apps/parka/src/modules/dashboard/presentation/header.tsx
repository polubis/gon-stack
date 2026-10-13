import { Plus, User } from 'lucide-react';
import type { Period } from '@/shared/period/period';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { UnreadLink } from '@/modules/notifications/presentation/unread-link';
import { Skeleton } from '@/shared/ui/skeleton';
import { PeriodControl } from './period-control';

export const Header = ({
  period,
  today,
  userName,
  initializing,
  onPeriodChange,
}: {
  period: Period;
  today: string;
  userName: string | undefined;
  initializing: boolean;
  onPeriodChange: (period: Period) => void;
}) => {
  const firstName = userName?.trim().split(' ')[0];
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3 md:flex-nowrap">
        <div className="min-w-0 flex-1 basis-0">
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            {initializing ? (
              <>
                <span className="sr-only">Cześć</span>
                <Skeleton className="h-8 w-48 lg:h-9" />
              </>
            ) : firstName ? (
              `Cześć, ${firstName} 👋`
            ) : (
              'Cześć 👋'
            )}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Oto Twoje wydatki w wybranym okresie.
          </p>
        </div>

        <UnreadLink />

        <a
          href={APP_ROUTER.settings()}
          aria-label="Profil i ustawienia"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand max-md:hidden"
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </a>

        <Button
          href={APP_ROUTER.newExpense()}
          className="h-11 w-auto shrink-0 py-0 max-md:hidden"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Dodaj wydatek
        </Button>
      </header>
      <PeriodControl period={period} today={today} onChange={onPeriodChange} />
    </div>
  );
};
