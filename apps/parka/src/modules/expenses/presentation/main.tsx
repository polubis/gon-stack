import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router';
import {
  CategoryAvatar,
  ErrorState,
  LoadingBanner,
  Segmented,
  Toast,
} from '@/modules/shared/ui';
import { ERROR_CODES, FILTER_OPTIONS } from '../configuration/constraints';
import { dateTimeLabel, money, monthLabel } from '../domain/format';
import { groupByMonth, sortByDateDesc, sumAmount } from '../domain/grouping';
import type { Expense, ExpenseId, Filter } from '../domain/models';
import { Provider, useContext } from './context';
import { ExpenseDetail } from './expense-detail';
import { Card } from './layout';
import { ListSkeleton } from './list-skeleton';

const ExpensesView = () => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const categories = ctx.useCategories();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<ExpenseId | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const selected = expenses.find((e) => e.id === selectedId) ?? null;

  const sorted = sortByDateDesc(expenses);
  const visible = filter === 'bills' ? sorted.filter((e) => e.isBill) : sorted;

  const row = (e: Expense) => {
    const category =
      categories.find((c) => c.id === e.categoryId) ?? categories[0];
    return (
      <li key={e.id}>
        <button
          type="button"
          onClick={() => {
            setSelectedId(e.id);
            setEditing(false);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-hover-soft"
          data-e2e={`expenses:row:${e.id}`}
        >
          <CategoryAvatar category={category} />
          <span className="flex-1">
            <span className="block text-sm font-medium">{e.merchant}</span>
            <span className="block text-xs text-ink-soft">
              {dateTimeLabel(e.date)}
            </span>
          </span>
          <span className="text-sm font-semibold tabular-nums">
            {money(e.amount)}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div data-e2e="expenses:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <header className="flex items-center gap-3 px-5 pb-2 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Wydatki</h1>
      </header>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2">
        {error ? (
          <ErrorState
            data-e2e="expenses:load-error"
            title="Nie udało się wczytać wydatków"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.dashboard()}
          />
        ) : null}

        <Segmented<Filter>
          label="Filtruj wydatki"
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
        />

        {initializing ? (
          <ListSkeleton />
        ) : filter === 'category' ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const items = visible.filter((e) => e.categoryId === category.id);
              if (items.length === 0) return null;
              return (
                <section key={category.id} aria-label={category.name}>
                  <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <CategoryAvatar category={category} className="h-6 w-6" />
                    {category.name}
                    <span className="ml-auto text-ink-soft">
                      {money(sumAmount(items))}
                    </span>
                  </h2>
                  <Card className="p-2">
                    <ul>{items.map(row)}</ul>
                  </Card>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {groupByMonth(visible).map(([m, items]) => (
              <section key={m} aria-label={monthLabel(m)}>
                <h2 className="mb-1 flex items-center justify-between text-sm font-semibold capitalize">
                  {monthLabel(m)}
                  <span className="text-ink-soft">
                    {money(sumAmount(items))}
                  </span>
                </h2>
                <Card className="p-2">
                  <ul>{items.map(row)}</ul>
                </Card>
              </section>
            ))}
            {visible.length === 0 && !error ? (
              <p className="text-sm text-ink-soft">Brak wydatków.</p>
            ) : null}
          </div>
        )}
      </main>

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
          data-e2e="expenses:toast"
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
        title="Wystąpił błąd widoku wydatków"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić listy. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <ExpensesView />
    </Provider>
  </ErrorBoundary>
);
