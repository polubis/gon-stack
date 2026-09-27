import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import {
  money,
  percent,
  monthLabel,
  prevMonth,
  nextMonth,
  currentMonth,
  toMonth,
} from '../domain/format';
import type { Month } from '../domain/models';
import { Provider, useContext } from './context';
import { QuickActionIcon } from './quick-action-icon';
import { Card } from './layout';
import { BarChart, Donut } from './charts';
import { LoadErrorFallback } from './load-error-fallback';

type IconId = 'add' | 'camera' | 'target' | 'repeat';

type Action = {
  label: string;
  href: string;
  iconId: IconId;
};

const QUICK_ACTIONS: Action[] = [
  { label: 'Dodaj paragon', href: '/receipt-scan/', iconId: 'add' },
  { label: 'Zrób zdjęcie', href: '/receipt-scan/', iconId: 'camera' },
  { label: 'Limity', href: '/limits/', iconId: 'target' },
  { label: 'Cykliczne', href: '/recurring/', iconId: 'repeat' },
];

const MONTH_PARAM = 'month';

const setMonthParam = (month: Month) => {
  const url = new URL(window.location.href);
  url.searchParams.set(MONTH_PARAM, month);
  window.history.replaceState(window.history.state, '', url);
};

const initialMonth = (): Month => {
  const fromUrl = new URLSearchParams(window.location.search).get(MONTH_PARAM);
  return toMonth(fromUrl ?? currentMonth());
};

const DashboardView = () => {
  const ctx = useContext();
  const [month, setMonth] = useState(initialMonth);
  const summary = ctx.useData();
  const error = ctx.useError();

  useEffect(() => {
    ctx.load(month);
  }, [month, ctx]);

  const goToMonth = (next: Month) => {
    setMonthParam(next);
    setMonth(next);
  };
  const goToPrevMonth = () => goToMonth(prevMonth(month));
  const goToNextMonth = () => goToMonth(nextMonth(month));

  const down = (summary?.change ?? 0) <= 0;

  return (
    <div data-e2e="dashboard:main" className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cześć 👋</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Oto Twoje wydatki w tym miesiącu.
          </p>
          {error && (
            <p
              className="mt-1 text-xs text-rose-700"
              data-e2e="dashboard:summary-error"
            >
              {error}
            </p>
          )}
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Poprzedni miesiąc"
              data-e2e="dashboard:prev-month"
              onClick={goToPrevMonth}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-black/5"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <span
              className="text-sm font-semibold capitalize"
              data-e2e="dashboard:month-label"
            >
              {monthLabel(month)}
            </span>
            <button
              type="button"
              aria-label="Następny miesiąc"
              data-e2e="dashboard:next-month"
              onClick={goToNextMonth}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-black/5"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div>
            <p
              className="text-3xl font-bold tracking-tight"
              data-e2e="dashboard:total"
            >
              {money(summary?.total ?? 0)}
            </p>
            <p
              className={cn(
                'mt-1 inline-flex items-center gap-1 text-sm font-medium',
                down ? 'text-brand-dark' : 'text-rose-600',
              )}
            >
              {down ? (
                <TrendingDown className="h-4 w-4" aria-hidden="true" />
              ) : (
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              )}
              {percent(summary?.change ?? 0)} vs {monthLabel(prevMonth(month))}
            </p>
          </div>

          <BarChart
            data={(summary?.trend ?? []).map((t) => ({
              label: monthLabel(t.month).slice(0, 3),
              value: t.total,
            }))}
            caption={`Wydatki w ostatnich miesiącach do ${monthLabel(month)}`}
          />
        </Card>

        <section aria-labelledby="quick-actions" className="space-y-2">
          <h2
            id="quick-actions"
            className="text-sm font-semibold text-ink-soft"
          >
            Szybkie akcje
          </h2>
          <ul className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ label, href, iconId }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-black/5 bg-white p-2 text-center text-[11px] font-medium text-ink-soft hover:bg-brand-softer"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft text-brand">
                    <QuickActionIcon id={iconId} className="h-4.5 w-4.5" />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Card className="space-y-3">
          <h2 className="text-sm font-semibold text-ink-soft">
            Rozkład wydatków
          </h2>
          {summary && summary.categories.length > 0 ? (
            <Donut
              caption={`Rozkład wydatków wg kategorii w ${monthLabel(month)}`}
              slices={summary.categories.map((c) => ({
                label: c.name,
                value: c.amount,
                color: c.color,
              }))}
            />
          ) : (
            <p className="text-sm text-ink-soft">
              Brak wydatków w tym miesiącu.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary fallback={({ reset }) => <LoadErrorFallback reset={reset} />}>
    <Provider>
      <DashboardView />
    </Provider>
  </ErrorBoundary>
);
