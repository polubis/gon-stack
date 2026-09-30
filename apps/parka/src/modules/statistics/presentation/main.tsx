import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import {
  ErrorState,
  LoadingBanner,
  ScreenHeader,
  Segmented,
} from '@/shared/ui';
import { APP_ROUTER } from '@/shared/router';
import {
  DEFAULT_RANGE,
  DEFAULT_TAB,
  ERROR_CODES,
} from '../configuration/constraints';
import { currentMonth, monthsEndingAt, prevMonth } from '../domain/format';
import type { Range, Tab } from '../domain/models';
import {
  biggestChanges,
  categoryBreakdown,
  changeVsPrevMonth,
  monthTotal,
  trend,
} from './selectors';
import { Provider, useContext } from './context';
import { Spending } from './spending';
import { Comparison } from './comparison';
import { StatisticsSkeleton } from './skeleton';

const StatisticsView = () => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const categories = ctx.useCategories();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [month] = useState(currentMonth);
  const [tab, setTab] = useState<Tab>(DEFAULT_TAB);
  const [range, setRange] = useState<Range>(DEFAULT_RANGE);

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const months = monthsEndingAt(month, Number(range));
  const rangeTotal = months.reduce((s, m) => s + monthTotal(expenses, m), 0);

  return (
    <div data-e2e="statistics:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Statystyki" />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:px-10 xl:px-16">
        <div className="md:max-w-sm">
          <Segmented<Tab>
            label="Widok statystyk"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'spending', label: 'Wydatki' },
              { value: 'comparison', label: 'Porównanie' },
            ]}
          />
        </div>

        {error ? (
          <ErrorState
            title="Nie udało się wczytać statystyk"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.dashboard()}
          />
        ) : initializing ? (
          <StatisticsSkeleton />
        ) : tab === 'spending' ? (
          <Spending
            range={range}
            onRangeChange={setRange}
            total={rangeTotal}
            points={trend(expenses, month, Number(range))}
            slices={categoryBreakdown(expenses, categories, months)}
          />
        ) : (
          <Comparison
            month={month}
            current={monthTotal(expenses, month)}
            previous={monthTotal(expenses, prevMonth(month))}
            monthChange={changeVsPrevMonth(expenses, month)}
            changes={biggestChanges(expenses, categories, month)}
          />
        )}
      </main>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku statystyk"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić statystyk. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <StatisticsView />
    </Provider>
  </ErrorBoundary>
);
