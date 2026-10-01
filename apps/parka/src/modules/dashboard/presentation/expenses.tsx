import { categoryLabel } from '@/shared/i18n/category-label';
import { useEffect, useState } from 'react';
import { APP_ROUTER } from '@/shared/router';
import {
  CategoryAvatar,
  ErrorState,
  LoadingBanner,
  Segmented,
  Toast,
} from '@/shared/ui';
import {
  ERROR_CODES,
  FILTER_OPTIONS,
  UNCATEGORIZED,
} from '../configuration/constraints';
import { dateTimeLabel, money, monthLabel } from '../domain/format';
import type { Expense, ExpenseFilter, ExpenseId } from '../domain/models';
import { useContext } from './context';
import { ExpenseDetail } from './expense-detail';
import { ExpensesSkeleton } from './expenses-skeleton';
import { Card } from './layout';
import { groupByMonth, sortByDateDesc, sumAmount } from './selectors';

export const Expenses = () => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const categories = ctx.useCategories();
  const error = ctx.useExpensesError();
  const notice = ctx.useNotice();
  const initializing = ctx.useExpensesInitializing();
  const isLoading = ctx.useExpensesLoading();
  const [filter, setFilter] = useState<ExpenseFilter>('all');
  const [selectedId, setSelectedId] = useState<ExpenseId | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    ctx.loadExpenses();
  }, [ctx]);

  const selected = expenses.find((e) => e.id === selectedId) ?? null;

  const sorted = sortByDateDesc(expenses);
  const visible = filter === 'bills' ? sorted.filter((e) => e.isBill) : sorted;

  const row = (e: Expense) => {
    const category =
      categories.find((c) => c.id === e.categoryId) ??
      categories[0] ??
      UNCATEGORIZED;
    return (
      <li key={e.id}>
        <button
          type="button"
          onClick={() => {
            setSelectedId(e.id);
            setEditing(false);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-hover-soft"
          data-e2e={`dashboard:expense:${e.id}`}
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
    <section
      aria-labelledby="expenses-heading"
      className="relative flex flex-col gap-4 md:gap-6 lg:col-span-3"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <h2
        id="expenses-heading"
        className="text-xl font-semibold tracking-tight"
      >
        Wydatki
      </h2>

      {error ? (
        <ErrorState
          data-e2e="dashboard:expenses-error"
          title="Nie udało się wczytać wydatków"
          code={ERROR_CODES.loadExpenses}
          description={error}
          onRetry={ctx.loadExpenses}
          backHref={APP_ROUTER.home()}
        />
      ) : null}

      <div className="md:max-w-md">
        <Segmented<ExpenseFilter>
          label="Filtruj wydatki"
          value={filter}
          onChange={setFilter}
          options={FILTER_OPTIONS}
        />
      </div>

      {initializing ? (
        <ExpensesSkeleton />
      ) : filter === 'category' ? (
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 lg:items-start">
          {categories.map((category) => {
            const items = visible.filter((e) => e.categoryId === category.id);
            if (items.length === 0) return null;
            return (
              <section
                key={category.id}
                aria-label={categoryLabel(category.name)}
              >
                <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold">
                  <CategoryAvatar category={category} className="h-6 w-6" />
                  {categoryLabel(category.name)}
                  <span className="ml-auto text-ink-soft">
                    {money(sumAmount(items))}
                  </span>
                </h3>
                <Card className="p-2">
                  <ul>{items.map(row)}</ul>
                </Card>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2 lg:items-start">
          {groupByMonth(visible).map(([m, items]) => (
            <section key={m} aria-label={monthLabel(m)}>
              <h3 className="mb-1 flex items-center justify-between text-sm font-semibold capitalize">
                {monthLabel(m)}
                <span className="text-ink-soft">{money(sumAmount(items))}</span>
              </h3>
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
    </section>
  );
};
