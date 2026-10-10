import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Button } from '@/shared/ui/controls';
import { Toast } from '@/shared/ui/toast';
import {
  closeModal,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { readQueryParam, writeQueryParam } from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES } from '../configuration/constraints';
import { currentMonth, toMonth } from '../domain/format';
import type { Month } from '../domain/models';
import { CategoriesCard } from './categories-card';
import { Provider, useContext } from './context';
import { ExpenseDetail } from './expense-detail';
import { LimitsCard } from './limits-card';
import { expenseModal, expenseOfModal } from './modal-ids';
import { MonthExpenses } from './month-expenses';
import { Header } from './header';
import { TotalHero } from './total-hero';
import { RecurringDetail } from './recurring-detail';
import { recurringChargeId, withRecurring } from './selectors';
import { DashboardSkeleton } from './skeleton';
import { SpendingChart } from './spending-chart';

const MONTH_PARAM = 'month';

const initialMonth = (): Month => {
  const fromUrl = readQueryParam(MONTH_PARAM);
  return toMonth(fromUrl ?? currentMonth());
};

const DashboardView = () => {
  const ctx = useContext();
  const [month, setMonth] = useState(initialMonth);
  const modals = useModalStack();
  const initialized = ctx.useInitialized();
  const loading = ctx.useLoading();
  const error = ctx.useError();
  const summary = ctx.useData();
  const recurring = ctx.useRecurring();
  const expenses = withRecurring(ctx.useExpenses(), recurring, month);
  const notice = ctx.useNotice();

  useEffect(() => {
    ctx.load(month);
  }, [month, ctx]);

  const goToMonth = (next: Month) => {
    writeQueryParam(MONTH_PARAM, next);
    setMonth(next);
  };

  // Detail popups stack in the order they were opened (URL order).
  const details = modals.flatMap((modal) => {
    const id = expenseOfModal(modal);
    if (id === null) return [];
    const expense = expenses.find((e) => e.id === id);
    const charge = recurring.find((r) => recurringChargeId(r.id, month) === id);
    return [{ modal, expense, charge }];
  });

  // A popup whose expense is gone (stale link) must not linger in the URL.
  const dangling =
    initialized && summary !== null
      ? details.find((d) => !d.expense && !d.charge)?.modal
      : undefined;
  useEffect(() => {
    if (dangling) closeModal(dangling);
  }, [dangling]);

  // One failure screen for the whole dashboard: all or nothing.
  if (error) {
    return (
      <div data-e2e="dashboard:main" className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col px-4 pb-6 pt-4 md:px-8 lg:px-10 lg:pt-8 xl:px-16">
          <ErrorState
            data-e2e="dashboard:summary-error"
            title="Nie udało się wczytać podsumowania"
            code={ERROR_CODES.load}
            description={error}
            onRetry={() => ctx.load(month)}
            backHref={APP_ROUTER.home()}
          />
        </main>
      </div>
    );
  }

  const ready = initialized && summary !== null;

  const overlays = (
    <>
      {details.map(({ modal, expense, charge }) =>
        charge ? (
          <RecurringDetail
            key={modal}
            modal={modal}
            recurring={charge}
            month={month}
            onClose={() => closeModal(modal)}
          />
        ) : expense ? (
          <ExpenseDetail
            key={modal}
            modal={modal}
            expense={expense}
            month={month}
            onClose={() => closeModal(modal)}
          />
        ) : null,
      )}
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="dashboard:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </>
  );

  return (
    <div data-e2e="dashboard:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={loading && ready} />
      <main className="flex flex-1 flex-col gap-4 px-4 pb-24 pt-4 md:gap-6 md:px-8 md:pb-6 lg:px-10 lg:pt-8 xl:grid xl:grid-cols-12 xl:content-start xl:px-16">
        <div className="xl:col-span-12">
          <Header
            month={month}
            userName={summary?.userName}
            initializing={!ready}
            onMonthChange={goToMonth}
          />
        </div>

        {ready ? (
          <>
            <div className="xl:col-span-6 xl:col-start-1 xl:row-start-2">
              <TotalHero summary={summary} />
            </div>
            <SpendingChart month={month} summary={summary} />
            <CategoriesCard month={month} summary={summary} />
            <MonthExpenses
              month={month}
              onSelect={(id) => openModal(expenseModal(id))}
            />
            <LimitsCard month={month} />
            {overlays}
          </>
        ) : (
          <DashboardSkeleton />
        )}
      </main>
      {/* Zero-height sticky rail: the button floats above the content, which
          scrolls clear of it thanks to the bottom padding of <main>. */}
      <div className="pointer-events-none sticky bottom-4 z-(--z-nav) h-0 md:hidden">
        <Button
          href={APP_ROUTER.newExpense()}
          data-e2e="dashboard:expense-fab"
          aria-label="Dodaj wydatek"
          className="pointer-events-auto absolute bottom-0 right-4 h-14 w-14 rounded-full p-0 shadow-popover"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku podsumowania"
        code={ERROR_CODES.render}
        description={error.message}
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
