import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import { readQueryParam, writeQueryParam } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES } from '../configuration/constraints';
import { currentMonth, toMonth } from '../domain/format';
import type { ExpenseId, Month } from '../domain/models';
import { CategoriesCard } from './categories-card';
import { Provider, useContext } from './context';
import { ExpenseDetail } from './expense-detail';
import { GoalsCard } from './goals-card';
import { LimitsCard } from './limits-card';
import { MonthExpenses } from './month-expenses';
import { Header } from './header';
import { Kpis } from './kpis';
import { RecurringCard } from './recurring-card';
import { SpendingChart } from './spending-chart';

const MONTH_PARAM = 'month';

const initialMonth = (): Month => {
  const fromUrl = readQueryParam(MONTH_PARAM);
  return toMonth(fromUrl ?? currentMonth());
};

const DashboardView = () => {
  const ctx = useContext();
  const [month, setMonth] = useState(initialMonth);
  const [selectedId, setSelectedId] = useState<ExpenseId | null>(null);
  const [editing, setEditing] = useState(false);
  const summary = ctx.useData();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const expenses = ctx.useExpenses();
  const notice = ctx.useNotice();
  // Failed first load: the ErrorState stands in for the summary cards.
  const failed = Boolean(error) && !summary;

  useEffect(() => {
    ctx.load(month);
  }, [month, ctx]);

  useEffect(() => {
    ctx.loadExpenses();
    ctx.loadLimits();
    ctx.loadRecurring();
  }, [ctx]);

  const goToMonth = (next: Month) => {
    writeQueryParam(MONTH_PARAM, next);
    setMonth(next);
  };

  const select = (id: ExpenseId) => {
    setSelectedId(id);
    setEditing(false);
  };
  const selected = expenses.find((e) => e.id === selectedId) ?? null;

  const overlays = (
    <>
      {selected ? (
        <ExpenseDetail
          expense={selected}
          editing={editing}
          onEdit={() => setEditing(true)}
          onClose={() => {
            setSelectedId(null);
            setEditing(false);
          }}
        />
      ) : null}
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="dashboard:toast"
          tone={notice.tone}
          message={notice.message}
          onDismiss={ctx.dismissNotice}
        />
      ) : null}
    </>
  );

  return (
    <div data-e2e="dashboard:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4 md:gap-6 md:px-8 lg:px-10 lg:pt-8 xl:grid xl:grid-cols-12 xl:content-start xl:px-16">
        <div className="xl:col-span-12">
          <Header
            month={month}
            userName={summary?.userName}
            initializing={initializing}
            onMonthChange={goToMonth}
          />
        </div>

        {error && (
          <div className="xl:col-span-12">
            <ErrorState
              data-e2e="dashboard:summary-error"
              title="Nie udało się wczytać podsumowania"
              code={ERROR_CODES.load}
              description={error}
              onRetry={() => ctx.load(month)}
              backHref={APP_ROUTER.home()}
            />
          </div>
        )}

        {failed ? null : (
          <>
            <div className="xl:col-span-12">
              <Kpis month={month} summary={summary} />
            </div>
            <SpendingChart month={month} summary={summary} />
            <CategoriesCard month={month} summary={summary} />
          </>
        )}
        <MonthExpenses month={month} onSelect={select} />
        <LimitsCard month={month} />
        <GoalsCard />
        <RecurringCard />
        {overlays}
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
