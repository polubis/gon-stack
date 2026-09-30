import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import {
  Button,
  Card,
  ErrorState,
  LoadingBanner,
  ScreenHeader,
  Skeleton,
} from '@/shared/ui';
import { APP_ROUTER } from '@/shared/router';
import { ERROR_CODES } from '../configuration/constraints';
import { currentMonth, money, monthLabel } from '../domain/format';
import {
  buildCsv,
  buildReport,
  expensesForMonth,
  summarize,
} from './selectors';
import { downloadBlob } from './download';
import { Provider, useContext } from './context';

const ReportsView = () => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const categories = ctx.useCategories();
  const recurring = ctx.useRecurring();
  const error = ctx.useError();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [month] = useState(currentMonth);

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const monthExpenses = expensesForMonth(expenses, month);
  const summary = summarize(monthExpenses, recurring);
  const disabled = initializing || error !== null;

  const downloadCsv = () =>
    downloadBlob(
      `parka-raport-${month}.csv`,
      'text/csv;charset=utf-8',
      buildCsv(monthExpenses, categories),
    );

  const downloadFull = () =>
    downloadBlob(
      `parka-raport-${month}.txt`,
      'text/plain;charset=utf-8',
      buildReport(month, summary, buildCsv(monthExpenses, categories)),
    );

  return (
    <div data-e2e="reports:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader title="Raport" backHref={APP_ROUTER.settings()} />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:grid lg:grid-cols-3 lg:content-start lg:items-start lg:px-10 xl:px-16">
        <p className="text-sm capitalize text-ink-soft lg:col-span-3">
          {monthLabel(month)}
        </p>

        {error && (
          <div className="lg:col-span-3">
            <ErrorState
              title="Nie udało się wczytać raportu"
              code={ERROR_CODES.load}
              description={error}
              onRetry={ctx.load}
              backHref={APP_ROUTER.settings()}
            />
          </div>
        )}

        <Card className="space-y-4 lg:col-span-2 lg:p-6">
          <div>
            <p className="text-sm text-ink-soft">Twój miesiąc w liczbach</p>
            {initializing ? (
              <Skeleton className="h-9 w-40" />
            ) : (
              <p
                className="text-3xl font-bold tracking-tight"
                data-e2e="reports:total"
              >
                {money(summary.total)}
              </p>
            )}
            <p className="text-xs text-ink-soft">Łączne wydatki</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-brand-softer p-3">
              {initializing ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="text-2xl font-bold" data-e2e="reports:categories">
                  {summary.categoryCount}
                </p>
              )}
              <p className="text-xs text-ink-soft">Kategorie</p>
            </div>
            <div className="rounded-xl bg-brand-softer p-3">
              {initializing ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                <p className="text-2xl font-bold" data-e2e="reports:recurring">
                  {summary.recurringCount}
                </p>
              )}
              <p className="text-xs text-ink-soft">Transakcje cykliczne</p>
            </div>
          </div>
        </Card>

        <div className="space-y-2 md:max-w-sm lg:max-w-none">
          <Button
            data-e2e="reports:download-csv"
            disabled={disabled}
            onClick={downloadCsv}
          >
            <FileText className="h-4 w-4" aria-hidden="true" /> Pobierz CSV
          </Button>
          <Button
            variant="ghost"
            data-e2e="reports:download-full"
            disabled={disabled}
            onClick={downloadFull}
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Pobierz pełny
            raport
          </Button>
        </div>
      </main>
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku raportu"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić raportu. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <Provider>
      <ReportsView />
    </Provider>
  </ErrorBoundary>
);
