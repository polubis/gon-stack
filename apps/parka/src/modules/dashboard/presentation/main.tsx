import { categoryLabel } from '@/shared/i18n/category-label';
import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { ErrorState, LoadingBanner, Skeleton } from '@/shared/ui';
import {
  DEFAULT_RANGE,
  ERROR_CODES,
  RANGES,
  RANGE_LABEL,
} from '../configuration/constraints';
import { readQueryParam, APP_ROUTER, writeQueryParam } from '@/shared/router';
import {
  money,
  percent,
  monthLabel,
  prevMonth,
  nextMonth,
  currentMonth,
  toMonth,
} from '../domain/format';
import type { Month, Range } from '../domain/models';
import { Provider, useContext } from './context';
import { QuickActionIcon } from './quick-action-icon';
import { Card } from './layout';
import { BarChart, Donut } from './charts';
import { Comparison } from './comparison';
import { RangePicker } from './range-picker';

type IconId = 'add' | 'camera' | 'target' | 'repeat';

type Action = {
  label: string;
  href: string;
  iconId: IconId;
};

const QUICK_ACTIONS: Action[] = [
  { label: 'Dodaj paragon', href: APP_ROUTER.receiptScan(), iconId: 'add' },
  { label: 'Zrób zdjecie', href: APP_ROUTER.receiptScan(), iconId: 'camera' },
  { label: 'Limity', href: APP_ROUTER.limits(), iconId: 'target' },
  { label: 'Cykliczne', href: APP_ROUTER.recurring(), iconId: 'repeat' },
];

const MONTH_PARAM = 'month';

const setMonthParam = (month: Month) => {
  writeQueryParam(MONTH_PARAM, month);
};

const RANGE_PARAM = 'range';

const isRange = (value: string | null): value is Range =>
  RANGES.some((r) => r === value);

const initialRange = (): Range => {
  const fromUrl = readQueryParam(RANGE_PARAM);
  return isRange(fromUrl) ? fromUrl : DEFAULT_RANGE;
};

const initialMonth = (): Month => {
  const fromUrl = readQueryParam(MONTH_PARAM);
  return toMonth(fromUrl ?? currentMonth());
};

const DashboardView = () => {
  const ctx = useContext();
  const [month, setMonth] = useState(initialMonth);
  const [range, setRange] = useState(initialRange);
  const summary = ctx.useData();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();

  useEffect(() => {
    ctx.load(month, range);
  }, [month, range, ctx]);

  const goToMonth = (next: Month) => {
    setMonthParam(next);
    setMonth(next);
  };
  const goToRange = (next: Range) => {
    writeQueryParam(RANGE_PARAM, next);
    setRange(next);
  };
  const goToPrevMonth = () => goToMonth(prevMonth(month));
  const goToNextMonth = () => goToMonth(nextMonth(month));

  const down = (summary?.change ?? 0) <= 0;

  return (
    <div data-e2e="dashboard:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4 md:gap-6 md:px-8 lg:grid lg:grid-cols-3 lg:content-start lg:px-10 lg:pt-8 xl:px-16">
        <RangePicker range={range} onRangeChange={goToRange} />

        <div className="lg:col-span-3">
          <h1 className="text-2xl font-semibold tracking-tight">Cześć 👋</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Oto Twoje wydatki w tym miesiącu.
          </p>
        </div>

        {error && (
          <div className="lg:col-span-3">
            <ErrorState
              data-e2e="dashboard:summary-error"
              title="Nie udało się wczytać podsumowania"
              code={ERROR_CODES.load}
              description={error}
              onRetry={() => ctx.load(month, range)}
              backHref={APP_ROUTER.home()}
            />
          </div>
        )}

        <Card className="space-y-3 lg:col-span-2 lg:row-span-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Poprzedni miesiąc"
              data-e2e="dashboard:prev-month"
              onClick={goToPrevMonth}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-hover"
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
              className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-hover"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div>
            <p
              className="text-3xl font-bold tracking-tight"
              data-e2e="dashboard:total"
            >
              {initializing ? (
                <Skeleton className="h-9 w-40" />
              ) : (
                money(summary?.total ?? 0)
              )}
            </p>
            {initializing ? (
              <Skeleton className="mt-1 h-5 w-32" />
            ) : (
              <p
                className={cn(
                  'mt-1 inline-flex items-center gap-1 text-sm font-medium',
                  down ? 'text-brand-dark' : 'text-danger-strong',
                )}
              >
                {down ? (
                  <TrendingDown className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                )}
                {percent(summary?.change ?? 0)} vs{' '}
                {monthLabel(prevMonth(month))}
              </p>
            )}
          </div>

          <p className="text-sm text-ink-soft">
            Razem ({RANGE_LABEL[range]}):{' '}
            {initializing ? (
              <Skeleton className="inline-block h-4 w-24 align-middle" />
            ) : (
              <span
                className="font-semibold text-ink"
                data-e2e="dashboard:range-total"
              >
                {money(summary?.rangeTotal ?? 0)}
              </span>
            )}
          </p>

          {initializing ? (
            <Skeleton className="h-37" />
          ) : (
            <BarChart
              data={(summary?.trend ?? []).map((t) => ({
                label: monthLabel(t.month).slice(0, 3),
                value: t.total,
              }))}
              caption={`Wydatki w zakresie ${RANGE_LABEL[range]} do ${monthLabel(month)}`}
            />
          )}
        </Card>

        <section aria-labelledby="quick-actions" className="space-y-2">
          <h2
            id="quick-actions"
            className="text-sm font-semibold text-ink-soft"
          >
            Szybkie akcje
          </h2>
          <ul className="grid grid-cols-4 gap-2 md:gap-4 lg:grid-cols-2">
            {QUICK_ACTIONS.map(({ label, href, iconId }) => (
              <li key={label}>
                <a
                  href={href}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-card p-2 text-center text-caption font-medium text-ink-soft hover:bg-brand-softer"
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
          {initializing ? (
            <Skeleton className="h-36 w-full" />
          ) : summary && summary.categories.length > 0 ? (
            <Donut
              caption={`Rozkład wydatków wg kategorii w zakresie ${RANGE_LABEL[range]}`}
              slices={summary.categories.map((c) => ({
                label: categoryLabel(c.name),
                value: c.amount,
                color: c.color,
              }))}
            />
          ) : (
            <p className="text-sm text-ink-soft">
              Brak wydatków w tym zakresie.
            </p>
          )}
        </Card>

        {summary ? (
          <Comparison month={month} summary={summary} />
        ) : (
          <>
            <Card className="space-y-3 lg:col-span-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-56" />
            </Card>
            <Card className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-full" />
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku podsumowania"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić podsumowania. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.home()}
      />
    )}
  >
    <Provider>
      <DashboardView />
    </Provider>
  </ErrorBoundary>
);
