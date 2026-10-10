import { useState, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import { categoryLabel } from '@/shared/i18n/category-label';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Card } from '@/shared/ui/layout';
import { cn } from '@repo/react-kit/cn';
import {
  EXPENSES_LIST_HEIGHT,
  MAX_VISIBLE_EXPENSES,
} from '../configuration/constraints';
import { money, monthTitle, shortDateTimeLabel } from '../domain/format';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
  Month,
} from '../domain/models';
import { DetailDialog } from './detail-dialog';
import { useContext } from './context';
import { RecurringMark } from './recurring-badge';
import { ShowAllFade } from './show-all-fade';
import {
  categoryOf,
  categoryTabs,
  expensesInMonth,
  sumAmount,
  touchesCategory,
  withRecurring,
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

const ROW_CLASS =
  'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left';

/** Every row, stored or recurring, opens its edit popup. */
const Row = ({
  id,
  onSelect,
  children,
}: {
  id: ExpenseId;
  onSelect: (id: ExpenseId) => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    data-e2e={`dashboard:expense:${id}`}
    className={cn(ROW_CLASS, 'hover:bg-hover-soft')}
  >
    {children}
  </button>
);

/** Rows of the expenses list; every row opens its edit popup. */
const ExpenseList = ({
  expenses,
  categories,
  onSelect,
}: {
  expenses: Expense[];
  categories: Category[];
  onSelect: (id: ExpenseId) => void;
}) => (
  <ul className="divide-y divide-line pr-2">
    {expenses.map((e) => {
      const category = categoryOf(categories, e.categoryId);
      return (
        <li key={e.id} className="group">
          <Row id={e.id} onSelect={onSelect}>
            <span className="relative shrink-0">
              <CategoryAvatar category={category} className="h-10 w-10" />
              {e.source === 'recurring' ? <RecurringMark /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {e.merchant}
              </span>
              <span className="block text-xs text-ink-soft">
                {shortDateTimeLabel(e.date)}
                <span className="sr-only">{`, ${categoryLabel(category.name)}`}</span>
              </span>
            </span>
            <span className="relative text-sm font-semibold tabular-nums">
              {money(e.amount)}
              <span
                role="tooltip"
                className="pointer-events-none absolute top-1/2 right-full z-(--z-tooltip) mr-3 hidden -translate-y-1/2 rounded-lg bg-card px-3 py-1.5 text-xs font-medium whitespace-nowrap text-ink shadow-popover md:group-hover:block md:group-focus-within:block"
              >
                {categoryLabel(category.name)}
              </span>
            </span>
          </Row>
        </li>
      );
    })}
  </ul>
);

/** All expenses of the selected month, recurring ones included, filterable by category. */
export const MonthExpenses = ({
  month,
  onSelect,
}: {
  month: Month;
  onSelect: (id: ExpenseId) => void;
}) => {
  const ctx = useContext();
  const expenses = withRecurring(ctx.useExpenses(), ctx.useRecurring(), month);
  const categories = ctx.useCategories();
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const [all, setAll] = useState(false);

  const inMonth = expensesInMonth(expenses, month);
  const tabs = categoryTabs(inMonth, categories);
  // The chosen category may have no expenses in another month: show all then.
  const active = tabs.some((t) => t.category.id === filter) ? filter : null;
  const visible = active
    ? inMonth.filter((e) => touchesCategory(e, categories, active))
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
          {`${visible.length} · ${money(sumAmount(visible))}`}
        </p>
        <Button
          variant="ghost"
          className="ml-auto w-auto px-3 py-1.5 max-md:hidden"
          data-e2e="dashboard:expense-new"
          href={APP_ROUTER.newExpense()}
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj wydatek
        </Button>
      </div>

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

      <div className={cn('relative overflow-hidden', EXPENSES_LIST_HEIGHT)}>
        {visible.length === 0 ? (
          <p className="py-2 text-sm text-ink-soft">
            Brak wydatków w tym miesiącu.
          </p>
        ) : (
          <ExpenseList
            expenses={visible.slice(0, MAX_VISIBLE_EXPENSES)}
            categories={categories}
            onSelect={onSelect}
          />
        )}
        {visible.length > MAX_VISIBLE_EXPENSES && (
          <ShowAllFade
            onClick={() => setAll(true)}
            data-e2e="dashboard:expenses-toggle"
          />
        )}
      </div>
      {all && (
        <DetailDialog
          data-e2e="dashboard:expenses-dialog"
          title="Wydatki"
          description={monthTitle(month)}
          onClose={() => setAll(false)}
        >
          <ExpenseList
            expenses={visible}
            categories={categories}
            onSelect={(id) => {
              setAll(false);
              onSelect(id);
            }}
          />
        </DetailDialog>
      )}
    </Card>
  );
};
