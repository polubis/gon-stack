import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router';
import { ErrorState, LoadingBanner, Segmented, Toast } from '@/shared/ui';
import { ERROR_CODES, TAB_OPTIONS } from '../configuration/constraints';
import { currentMonth } from '../domain/format';
import type { Tab } from '../domain/models';
import { categoryProgress, totalProgress } from './selectors';
import { CategoryLimits } from './category-limits';
import { Provider, useContext } from './context';
import { GoalsTab } from './goals-tab';
import { LimitsSkeleton } from './limits-skeleton';
import { TotalLimit } from './total-limit';

const LimitsView = () => {
  const ctx = useContext();
  const limits = ctx.useLimits();
  const goals = ctx.useGoals();
  const categories = ctx.useCategories();
  const expenses = ctx.useExpenses();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [month] = useState(currentMonth);
  const [tab, setTab] = useState<Tab>('total');

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const renderTab = (current: Tab) => {
    switch (current) {
      case 'total':
        return (
          <TotalLimit
            limit={limits.find((l) => l.scope === 'total')}
            progress={totalProgress(limits, expenses, month)}
            month={month}
          />
        );
      case 'category':
        return (
          <CategoryLimits
            progress={categoryProgress(limits, expenses, month)}
            categories={categories}
          />
        );
      case 'goals':
        return <GoalsTab goals={goals} />;
      default: {
        const unreachable: never = current;
        return unreachable;
      }
    }
  };

  return (
    <div data-e2e="limits:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <header className="flex items-center gap-3 px-5 pb-2 pt-6 md:px-8 lg:px-10 lg:pt-8 xl:px-16">
        <h1 className="text-2xl font-semibold tracking-tight">Limity i cele</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:px-10 xl:px-16">
        {error ? (
          <ErrorState
            title="Nie udało się wczytać limitów"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.dashboard()}
          />
        ) : null}

        <div className="md:max-w-md">
          <Segmented<Tab>
            label="Widok limitów"
            value={tab}
            onChange={setTab}
            options={TAB_OPTIONS}
          />
        </div>

        {initializing ? <LimitsSkeleton /> : renderTab(tab)}
      </main>

      {notice ? (
        <Toast
          key={notice.id}
          tone={notice.tone}
          message={notice.message}
          onDismiss={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku limitów"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić limitów. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <LimitsView />
    </Provider>
  </ErrorBoundary>
);
