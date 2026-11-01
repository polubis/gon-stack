import { useState, type ReactNode } from 'react';
import { Plus, Receipt } from 'lucide-react';
import { useModal } from '@/shared/router/modal-stack';
import { categoryLabel } from '@/shared/i18n/category-label';
import { APP_ROUTER } from '@/shared/router/routes';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { changeProps, useListChanges } from '@/shared/ui/list-changes';
import { Card } from '@/shared/ui/layout';
import { cn } from '@repo/react-kit/cn';
import {
  EXPENSES_LIST_HEIGHT,
  MAX_VISIBLE_EXPENSES,
} from '../configuration/constraints';
import { containsDate, todayDay, type Period } from '@/shared/period/period';
import { money, plainDateLabel, shortDateTimeLabel } from '../domain/format';
import { periodTitle } from '../domain/period';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
  Upcoming,
} from '../domain/models';
import { DetailDialog } from './detail-dialog';
import { DeviceBadge } from './device-badge';
import { useContext } from './context';
import { ExpenseMenu } from './expense-menu';
import { EXPENSES_MODAL } from './modal-ids';
import { RecurringMark, UpcomingBadge } from './recurring-badge';
import { ShowAllFade } from './show-all-fade';
import {
  categoryOf,
  categoryTabs,
  expensesInPeriod,
  sumAmount,
  touchesCategory,
  upcomingCharges,
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
    className={cn(ROW_CLASS, 'min-w-0 flex-1 hover:bg-hover-soft')}
  >
    {children}
  </button>
);

const expenseKey = (e: Expense) => e.id;

/** Rows of the expenses list; every row opens its edit popup. */
const ExpenseList = ({
  expenses,
  categories,
  onSelect,
  scope,
  empty,
}: {
  expenses: Expense[];
  categories: Category[];
  onSelect: (id: ExpenseId) => void;
  /** Changes of the list scope (period, filter) swap rows without animation. */
  scope: string;
  /** Shown once no row is left, after the last one finished leaving. */
  empty?: ReactNode;
}) => {
  const rows = useListChanges(expenses, expenseKey, scope);
  if (rows.length === 0 && empty) return empty;
  return (
    <ul className="divide-y divide-line pr-2">
      {rows.map(({ key, item: e, phase }) => {
        const category = categoryOf(categories, e.categoryId);
        const change = changeProps(phase);
        return (
          <li
            key={key}
            aria-hidden={change['aria-hidden']}
            inert={change.inert}
            className={cn('group flex items-center gap-1', change.className)}
          >
            <Row id={e.id} onSelect={onSelect}>
              <span className="relative shrink-0">
                <CategoryAvatar category={category} className="h-10 w-10" />
                {e.recurringId !== null ? <RecurringMark /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {e.merchant}
                </span>
                <span className="flex items-center gap-2 text-xs text-ink-soft">
                  <span className="shrink-0">
                    {shortDateTimeLabel(e.date)}
                    <span className="sr-only">{`, ${categoryLabel(category.name)}`}</span>
                  </span>
                  {e.device ? <DeviceBadge device={e.device} /> : null}
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
            <ExpenseMenu expense={e} />
          </li>
        );
      })}
    </ul>
  );
};

/**
 * Payments the recurring rules will charge next: a projection, not expenses,
 * so they sit apart from the list and never reach a sum.
 */
const UpcomingList = ({
  upcoming,
  categories,
  onSelect,
}: {
  upcoming: Upcoming[];
  categories: Category[];
  onSelect: (id: ExpenseId) => void;
}) => (
  <section
    aria-labelledby="upcoming-expenses"
    className="rounded-xl border border-dashed border-line-strong p-2"
    data-e2e="dashboard:upcoming"
  >
    <h3
      id="upcoming-expenses"
      className="px-2 pb-1 text-xs font-semibold text-ink-soft"
    >
      Nadchodzące · nie wliczone do podsumowania
    </h3>
    <ul className="divide-y divide-line">
      {upcoming.map(({ id, recurring, date }) => {
        const category = categoryOf(categories, recurring.categoryId);
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              data-e2e={`dashboard:upcoming:${id}`}
              className={cn(ROW_CLASS, 'hover:bg-hover-soft')}
            >
              <span className="relative shrink-0">
                <CategoryAvatar category={category} className="h-10 w-10" />
                <RecurringMark />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {recurring.name}
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                  <span className="shrink-0">{plainDateLabel(date)}</span>
                  <UpcomingBadge />
                </span>
              </span>
              <span className="text-sm font-semibold tabular-nums text-ink-soft">
                {money(recurring.cost)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  </section>
);

/**
 * Scope of the list rows: a period or filter switch (and the load it starts)
 * swaps rows silently; only edits within one scope animate.
 */
const useListScope = (period: string, filter: string, loading: boolean) => {
  const [seen, setSeen] = useState(period);
  const [switching, setSwitching] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);
  if (seen !== period) {
    setSeen(period);
    setSwitching(true);
  }
  if (wasLoading !== loading) {
    setWasLoading(loading);
    if (wasLoading && switching) setSwitching(false);
  }
  return `${filter}|${period}|${switching}`;
};

/** All expenses of the selected period, filterable by category; upcoming payments announced apart. */
export const MonthExpenses = ({
  period,
  onSelect,
}: {
  period: Period;
  onSelect: (id: ExpenseId) => void;
}) => {
  const ctx = useContext();
  const expenses = ctx.useExpenses();
  const recurring = ctx.useRecurring();
  const categories = ctx.useCategories();
  const [filter, setFilter] = useState<CategoryId | null>(null);
  const all = useModal(EXPENSES_MODAL);
  const loading = ctx.useLoading();

  const today = todayDay();
  // Only the present period looks ahead; a past one is just history.
  const upcoming = containsDate(period, today)
    ? upcomingCharges(recurring, today, period)
    : [];
  const inPeriod = expensesInPeriod(expenses, period);
  const tabs = categoryTabs(inPeriod, categories);
  // The chosen category may have no expenses in another period: show all then.
  const active = tabs.some((t) => t.category.id === filter) ? filter : null;
  const visible = active
    ? inPeriod.filter((e) => touchesCategory(e, categories, active))
    : inPeriod;

  const scope = useListScope(periodTitle(period), String(active), loading);

  return (
    <Card
      as="section"
      aria-labelledby="month-expenses"
      className="space-y-4 xl:col-span-6 xl:col-start-1 xl:row-start-2"
      data-e2e="dashboard:expenses"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="month-expenses" className="text-base font-semibold">
          Wydatki
        </h2>
        <p className="ml-auto text-sm text-ink-soft">
          {`${visible.length} · ${money(sumAmount(visible))}`}
        </p>
      </div>

      {/* Fixed height, always filled: the filter row never leaves a gap or moves the list. */}
      <div className="h-10 md:h-12">
        <div
          role="group"
          aria-label="Filtruj wydatki wg kategorii"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-1 md:[scrollbar-width:thin]"
        >
          <Chip
            active={active === null}
            onClick={() => setFilter(null)}
            data-e2e="dashboard:filter:all"
          >
            {`Wszystkie ${inPeriod.length}`}
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
      </div>

      {/* Stable wrapper owns the gap: the conditional widget adds no spacing of its own. */}
      <div className="space-y-3">
        {upcoming.length > 0 ? (
          <UpcomingList
            upcoming={upcoming}
            categories={categories}
            onSelect={onSelect}
          />
        ) : null}

        <div className={cn('relative overflow-hidden', EXPENSES_LIST_HEIGHT)}>
          <ExpenseList
            expenses={visible.slice(0, MAX_VISIBLE_EXPENSES)}
            categories={categories}
            onSelect={onSelect}
            scope={scope}
            empty={
              <EmptyState
                variant="card"
                data-e2e="dashboard:expenses-empty"
                className="h-full"
                icon={Receipt}
                title="Brak wydatków w tym okresie."
                description={`Nie dodano jeszcze wydatków: ${periodTitle(period)}.`}
                action={
                  <Button
                    href={APP_ROUTER.newExpense()}
                    data-e2e="dashboard:expense-empty-new"
                    className="w-auto px-3 py-1.5"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    Dodaj wydatek
                  </Button>
                }
              />
            }
          />
          {visible.length > MAX_VISIBLE_EXPENSES && (
            <ShowAllFade
              onClick={all.open}
              data-e2e="dashboard:expenses-toggle"
            />
          )}
        </div>
      </div>
      {all.isOpen && (
        <DetailDialog
          modal={EXPENSES_MODAL}
          data-e2e="dashboard:expenses-dialog"
          title="Wydatki"
          description={periodTitle(period)}
          onClose={all.close}
        >
          <ExpenseList
            expenses={visible}
            categories={categories}
            onSelect={onSelect}
            scope={scope}
          />
        </DetailDialog>
      )}
    </Card>
  );
};
