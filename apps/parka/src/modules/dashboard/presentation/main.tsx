import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { cn } from '@repo/react-kit/cn';
import { CategoryModals } from '@/modules/categories/presentation/category-modals';
import { Toast } from '@/shared/ui/toast';
import {
  closeModal,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { readQueryParam, writeQueryParams } from '@/shared/router/navigation';
import { clampPeriod, todayDay, type Period } from '@/shared/period/period';
import { APP_ROUTER } from '@/shared/router/routes';
import { ERROR_CODES } from '../configuration/constraints';
import { periodFromQuery, periodToQuery } from '../domain/period';
import { AddMenu, ADD_BUTTON } from './add-menu';
import { usePeriodSwipe } from '@/shared/period-control/presentation/use-period-swipe';
import { CategoriesCard } from './categories-card';
import { Provider, useContext } from './context';
import { ExpenseDetail } from './expense-detail';
import { LimitsCard } from './limits-card';
import { expenseModal, expenseOfModal } from './modal-ids';
import { MonthExpenses } from './month-expenses';
import { Header } from './header';
import { TotalHero } from './total-hero';
import { RecurringDetail } from './recurring-detail';
import { upcomingCharges } from './selectors';
import { DashboardSkeleton } from './skeleton';
import { SpendingChart } from './spending-chart';

const PERIOD_PARAMS = ['month', 'range', 'from', 'to'] as const;

const initialPeriod = (): Period =>
  periodFromQuery(
    {
      month: readQueryParam('month'),
      range: readQueryParam('range'),
      from: readQueryParam('from'),
      to: readQueryParam('to'),
    },
    todayDay(),
  );

const DashboardView = () => {
  const ctx = useContext();
  const [period, setPeriod] = useState(initialPeriod);
  const today = todayDay();
  const modals = useModalStack();
  const initialized = ctx.useInitialized();
  const loading = ctx.useLoading();
  const error = ctx.useError();
  const summary = ctx.useData();
  const recurring = ctx.useRecurring();
  const expenses = ctx.useExpenses();
  const notice = ctx.useNotice();
  const avatar = ctx.useAvatar();

  useEffect(() => {
    ctx.load(period);
  }, [period, ctx]);

  // Future periods hold nothing, so every move is clamped to the present.
  const goToPeriod = (next: Period) => {
    const target = clampPeriod(next, today);
    writeQueryParams({
      ...Object.fromEntries(PERIOD_PARAMS.map((name) => [name, null])),
      ...periodToQuery(target),
    });
    setPeriod(target);
  };

  const { gesture, go } = usePeriodSwipe({
    period,
    today,
    onChange: goToPeriod,
  });

  const upcoming = upcomingCharges(recurring, today);

  // Detail popups stack in the order they were opened (URL order).
  const details = modals.flatMap((modal) => {
    const id = expenseOfModal(modal);
    if (id === null) return [];
    const expense = expenses.find((e) => e.id === id);
    const projected = upcoming.find((u) => u.id === id);
    return [{ modal, expense, projected }];
  });

  // A popup whose expense is gone (stale link) must not linger in the URL.
  const dangling =
    initialized && summary !== null
      ? details.find((d) => !d.expense && !d.projected)?.modal
      : undefined;
  useEffect(() => {
    if (dangling) closeModal(dangling);
  }, [dangling]);

  // One failure screen for the whole dashboard: all or nothing.
  if (error) {
    return (
      <div
        data-e2e="dashboard:main"
        className="flex flex-1 animate-view-enter flex-col motion-reduce:animate-none"
      >
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-6 pt-4 md:px-8 lg:px-10 lg:pt-8 xl:px-16">
          <ErrorState
            data-e2e="dashboard:summary-error"
            title="Nie udało się wczytać podsumowania"
            code={ERROR_CODES.load}
            description={error}
            onRetry={() => ctx.load(period)}
            backHref={APP_ROUTER.home()}
          />
        </main>
      </div>
    );
  }

  const ready = initialized && summary !== null;

  const overlays = (
    <>
      {details.map(({ modal, expense, projected }) =>
        projected ? (
          <RecurringDetail
            key={modal}
            modal={modal}
            upcoming={projected}
            period={period}
            onClose={() => closeModal(modal)}
          />
        ) : expense ? (
          <ExpenseDetail
            key={modal}
            modal={modal}
            expense={expense}
            period={period}
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
    <div
      data-e2e="dashboard:main"
      className="relative flex flex-1 animate-view-enter flex-col overflow-x-clip motion-reduce:animate-none"
    >
      <LoadingBanner active={loading && ready} />
      <main
        {...gesture}
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-3 px-4 pb-24 pt-4 md:gap-4 md:px-8 md:pb-6 lg:px-10 lg:pt-8 xl:grid xl:grid-cols-12 xl:content-start xl:px-16"
      >
        <div className="xl:col-span-12">
          <Header
            period={period}
            today={today}
            avatar={avatar}
            onPeriodChange={go}
          />
        </div>

        {ready ? (
          <>
            <div className="xl:col-span-6 xl:col-start-1 xl:row-start-2">
              <TotalHero period={period} summary={summary} />
            </div>
            <MonthExpenses
              period={period}
              onSelect={(id) => openModal(expenseModal(id))}
            />
            <CategoriesCard period={period} summary={summary} />
            <LimitsCard period={period} />
            <SpendingChart period={period} summary={summary} />
            {overlays}
          </>
        ) : (
          <DashboardSkeleton />
        )}
      </main>
      <CategoryModals />
      {/* Zero-height sticky rail: the button floats above the content, which
          scrolls clear of it thanks to the bottom padding of <main>. */}
      <div className="pointer-events-none sticky bottom-4 z-(--z-nav) h-0 md:hidden">
        <AddMenu
          side="top"
          data-e2e="dashboard:expense-fab"
          aria-label="Dodaj"
          className={cn(
            ADD_BUTTON,
            'pointer-events-auto absolute bottom-0 right-4 h-14 w-14 animate-pop-in rounded-full shadow-popover motion-reduce:animate-none',
          )}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </AddMenu>
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
