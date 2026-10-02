import { ChevronDown, Plus, User } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { Skeleton } from '@/shared/ui/skeleton';
import { MONTH_OPTIONS_COUNT } from '../configuration/constraints';
import { currentMonth, monthTitle, toMonth } from '../domain/format';
import type { Month } from '../domain/models';
import { monthOptions } from './selectors';

export const Header = ({
  month,
  userName,
  initializing,
  onMonthChange,
}: {
  month: Month;
  userName: string | undefined;
  initializing: boolean;
  onMonthChange: (month: Month) => void;
}) => {
  const firstName = userName?.trim().split(' ')[0];
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-3 lg:flex-nowrap">
      <div className="min-w-0 flex-1 basis-full md:basis-auto">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {initializing ? (
            <>
              <span className="sr-only">Cześć</span>
              <Skeleton className="h-8 w-48" />
            </>
          ) : firstName ? (
            `Cześć, ${firstName} 👋`
          ) : (
            'Cześć 👋'
          )}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Oto Twoje wydatki w wybranym miesiącu.
        </p>
      </div>

      <label className="relative block max-md:flex-1">
        <span className="sr-only">Miesiąc</span>
        <select
          data-e2e="dashboard:month-select"
          value={month}
          onChange={(e) => onMonthChange(toMonth(e.target.value))}
          className="w-full cursor-pointer appearance-none rounded-xl border border-line-strong bg-card h-11 pl-4 pr-10 text-sm font-medium text-ink"
        >
          {monthOptions(month, currentMonth(), MONTH_OPTIONS_COUNT).map((m) => (
            <option key={m} value={m}>
              {monthTitle(m)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
        />
      </label>

      <Button
        href={APP_ROUTER.receiptScan()}
        className="h-11 w-auto shrink-0 py-0"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Dodaj wydatek
      </Button>

      <a
        href={APP_ROUTER.settings()}
        aria-label="Profil i ustawienia"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand max-md:hidden"
      >
        <User className="h-5 w-5" aria-hidden="true" />
      </a>
    </header>
  );
};
