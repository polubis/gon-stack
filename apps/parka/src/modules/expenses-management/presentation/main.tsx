import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import {
  navigateTo,
  readQueryParam,
  writeQueryParam,
} from '@/shared/router/navigation';
import { APP_ROUTER } from '@/shared/router/routes';
import { Segmented } from '@/shared/ui/controls';
import { ErrorState } from '@/shared/ui/error-state';
import { ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import {
  ERROR_CODES,
  EXPENSE_ID_PARAM,
  KIND_PARAM,
  MONTH_PARAM,
} from '../configuration/constraints';
import type { ExpenseKind } from '../domain/models';
import { Provider, useContext } from './context';
import { EditExpenseForm } from './edit-expense-form';
import { NewExpenseForm } from './new-expense-form';
import { ReceiptUpload } from './receipt-upload';
import { RecurringForm } from './recurring-form';
import { PageSkeleton } from './skeleton';

const KINDS: { value: ExpenseKind; label: string }[] = [
  { value: 'normal', label: 'Normalny' },
  { value: 'recurring', label: 'Cykliczny' },
];

const initialKind = (): ExpenseKind =>
  readQueryParam(KIND_PARAM) === 'recurring' ? 'recurring' : 'normal';

const ExpensesManagementView = () => {
  const ctx = useContext();
  const [kind, setKind] = useState(initialKind);
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const saved = ctx.useSaved();
  const scanned = ctx.useScanned();
  const [editing] = useState(() => window.location.pathname.includes('/edit/'));
  const expenseId = editing ? readQueryParam(EXPENSE_ID_PARAM) : null;
  const month = readQueryParam(MONTH_PARAM);
  const expense = ctx.useExpense();
  const expenseLoading = ctx.useExpenseLoading();

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  useEffect(() => {
    if (expenseId) ctx.loadExpense(expenseId);
  }, [ctx, expenseId]);

  useEffect(() => {
    if (saved) navigateTo(APP_ROUTER.dashboard({ month: saved }));
  }, [saved]);

  const changeKind = (next: ExpenseKind) => {
    writeQueryParam(KIND_PARAM, next);
    setKind(next);
  };

  return (
    <div
      data-e2e="expenses-management:main"
      className="relative flex flex-1 flex-col"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader
          title={editing ? 'Edytuj wydatek' : 'Nowy wydatek'}
          backHref={APP_ROUTER.dashboard({ month: month ?? undefined })}
        />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-4 pt-2 md:gap-6 md:px-8 lg:px-10 xl:px-16">
        {error ? (
          <ErrorState
            data-e2e="expenses-management:load-error"
            title="Nie udało się wczytać kategorii"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.dashboard()}
          />
        ) : null}

        {initializing || (editing && expenseLoading) ? (
          <PageSkeleton />
        ) : editing ? (
          expense ? (
            <EditExpenseForm key={expense.id} expense={expense} month={month} />
          ) : error ? null : (
            <ErrorState
              data-e2e="expenses-management:not-found"
              title="Nie znaleziono wydatku"
              code={ERROR_CODES.notFound}
              description="Ten wydatek nie istnieje lub został już usunięty."
              onRetry={() => expenseId && ctx.loadExpense(expenseId)}
              backHref={APP_ROUTER.dashboard({ month: month ?? undefined })}
              backLabel="Wróć do podsumowania"
            />
          )
        ) : (
          <>
            <div
              data-e2e="expenses-management:kind-nav"
              className="md:max-w-md"
            >
              <Segmented<ExpenseKind>
                label="Rodzaj wydatku"
                options={KINDS}
                value={kind}
                onChange={changeKind}
              />
            </div>
            {kind === 'normal' ? (
              <ReceiptUpload>
                <NewExpenseForm
                  key={scanned?.id ?? 0}
                  draft={scanned?.draft ?? null}
                />
              </ReceiptUpload>
            ) : (
              <RecurringForm />
            )}
          </>
        )}
      </main>

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="expenses-management:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku wydatku"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <ExpensesManagementView />
    </Provider>
  </ErrorBoundary>
);
