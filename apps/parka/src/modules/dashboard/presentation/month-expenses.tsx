import { useState } from 'react';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Card } from '@/shared/ui/layout';
import { ErrorState } from '@/shared/ui/error-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@repo/react-kit/cn';
import { ERROR_CODES } from '../configuration/constraints';
import { money, shortDateLabel } from '../domain/format';
import type { CategoryId, ExpenseId, Month } from '../domain/models';
import { useContext } from './context';
import {
  categoryOf,
  categoryTabs,
  expensesInMonth,
  sumAmount,
} from './selectors';

const Chip = ({
  active,
  onClick,
  color,
  children,
  'data-e2e': dataE2e,
}: {
  active: boolean;
  onClick: () => void;
  color?: string;
  children: string;
  'data-e2e': `dashboard:filter:${string}`;
}) => (
  <button
    type="button"
    aria-pressed={active}
    data-e2e={dataE2e}
    onClick={onClick}
    className={cn(
      'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'border-transparent bg-brand text-on-brand'
        : 'border-line-strong bg-card text-ink-soft hover:bg-hover-soft',
    )}
  >
    {color ? (
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
    ) : null}
    {children}
  </button>
);

const ListSkeleton = () => (
  <ul aria-hidden="true" className="divide-y divide-line">
    {Array.from({ length: 4 }, (_, i) => (
      <li key={i} className="flex items-center gap-3 py-2">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <span className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </span>
        <Skeleton className="h-4 w-16" />
      </li>
    ))}
  </ul>
);

/** All expenses of the selected month, filterable by category. */
export const MonthExpenses = ({
  month,
  onSelect,
}: {
  month: Month;
  onSelect: (id: ExpenseId) => void;
}) => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const categories = ctx.useCategories();
  const error = ctx.useExpensesError();
  const initializing = ctx.useExpensesInitializing();
  const [filter, setFilter] = useState<CategoryId | null>(null);

  const inMonth = expensesInMonth(expenses, month);
  const tabs = categoryTabs(inMonth, categories);
  // The chosen category may have no expenses in another month: show all then.
  const active = tabs.some((t) => t.category.id === filter) ? filter : null;
  const visible = active
    ? inMonth.filter((e) => categoryOf(categories, e.categoryId).id === active)
    : inMonth;

  return (
    <Card
      as="section"
      aria-labelledby="month-expenses"
      className="space-y-3 xl:col-span-8"
      data-e2e="dashboard:expenses"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="month-expenses" className="text-base font-semibold">
          Wydatki
        </h2>
        <p className="text-sm text-ink-soft">
          {initializing ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            `${visible.length} · ${money(sumAmount(visible))}`
          )}
        </p>
      </div>

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

      {tabs.length > 1 ? (
        <div
          role="group"
          aria-label="Filtruj wydatki wg kategorii"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
        >
          <Chip
            active={active === null}
            onClick={() => setFilter(null)}
            data-e2e="dashboard:filter:all"
          >
            {`Wszystkie ${inMonth.length}`}
          </Chip>
          {tabs.map(({ category, count }) => (
            <Chip
              key={category.id}
              active={active === category.id}
              color={category.color}
              onClick={() => setFilter(category.id)}
              data-e2e={`dashboard:filter:${category.id}`}
            >
              {`${categoryLabel(category.name)} ${count}`}
            </Chip>
          ))}
        </div>
      ) : null}

      {initializing ? (
        <ListSkeleton />
      ) : visible.length === 0 ? (
        <p className="py-2 text-sm text-ink-soft">
          Brak wydatków w tym miesiącu.
        </p>
      ) : (
        <ul className="max-h-96 divide-y divide-line overflow-y-auto pr-2">
          {visible.map((e) => {
            const category = categoryOf(categories, e.categoryId);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e.id)}
                  data-e2e={`dashboard:expense:${e.id}`}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-hover-soft"
                >
                  <CategoryAvatar category={category} className="h-10 w-10" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {e.merchant}
                    </span>
                    <span className="block text-xs text-ink-soft">
                      {shortDateLabel(e.date)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {money(e.amount)}
                  </span>
                  <span className="hidden rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark md:inline">
                    {categoryLabel(category.name)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
