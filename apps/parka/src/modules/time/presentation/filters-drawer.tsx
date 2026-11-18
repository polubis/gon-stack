import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { RotateCcw, X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { ClearableInput } from '@/shared/ui/clearable';
import { Button } from '@/shared/ui/controls';
import { CategoryIcon } from '@/shared/ui/icon';
import {
  activeFilterCount,
  NO_FILTERS,
  RECURRING_FILTERS,
  STATUS_FILTERS,
  STATUS_LABELS,
  TASK_SORTS,
  TIMING_FILTERS,
  toggled,
  type RecurringFilter,
  type TaskSort,
  type TimingFilter,
} from '../domain/filters';
import { useContext } from './context';
import { PRIORITY_TONE, PriorityMeter } from './priority-badge';
import { priorityLevel } from '../domain/priority';

const CHIP =
  'pressable inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand';

const TIMING_LABELS: Record<TimingFilter, string> = {
  all: 'Wszystkie',
  timed: 'Z godziną',
  'whole-day': 'Cały dzień',
};

const RECURRING_LABELS: Record<RecurringFilter, string> = {
  all: 'Wszystkie',
  only: 'Cykliczne',
  none: 'Jednorazowe',
};

const SORT_LABELS: Record<TaskSort, string> = {
  time: 'Godzina',
  priority: 'Priorytet',
  title: 'Nazwa',
};

const Group = ({ label, children }: { label: string; children: ReactNode }) => (
  <div
    role="group"
    aria-label={label}
    className="flex flex-col gap-2 border-b border-line pb-4"
  >
    <span aria-hidden="true" className="text-sm font-semibold text-ink">
      {label}
    </span>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

/** Multi choice: any number of chips on. */
const Chip = ({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={pressed}
    onClick={onClick}
    className={cn(
      CHIP,
      pressed
        ? 'border-brand bg-brand text-on-brand'
        : 'border-line bg-card text-ink hover:bg-brand-softer',
    )}
  >
    {children}
  </button>
);

/** Same marks as elsewhere: category icon in its color, priority pips in its tone. */
const Mark = ({
  pressed,
  className,
  style,
  children,
}: {
  pressed: boolean;
  className?: string;
  style?: { color: string };
  children: ReactNode;
}) => (
  <span
    aria-hidden="true"
    style={style}
    className={cn(
      'mr-2 inline-flex shrink-0 items-center rounded-full p-1',
      pressed && 'bg-card',
      className,
    )}
  >
    {children}
  </span>
);

/** Single choice: exactly one radio on. */
const Radios = <T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}) => (
  <div
    role="radiogroup"
    aria-label={label}
    className="flex flex-col gap-2 border-b border-line pb-4"
  >
    <span aria-hidden="true" className="text-sm font-semibold text-ink">
      {label}
    </span>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          onClick={() => onChange(option)}
          className={cn(
            CHIP,
            option === value
              ? 'border-brand bg-brand text-on-brand'
              : 'border-line bg-card text-ink hover:bg-brand-softer',
          )}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Filters and sorting of the task lists, in the look of the account drawer.
 * Lives in the URL modal stack; every choice is written to the query params at
 * once, so the lists change behind it and a link restores the same view.
 */
export const FiltersDrawer = ({ modal }: { modal: string }) => {
  const { filters, setFilters, categories, priorities, visibleTasks } =
    useContext();
  useModalMounted(modal);
  const active = activeFilterCount(filters);
  const dirty = active > 0 || filters.sort !== NO_FILTERS.sort;
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) closeModal(modal);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="time:filters-drawer"
          onOpenAutoFocus={(e) => {
            // Focus the panel itself: no input grabs focus, so no mobile keyboard pops up.
            e.preventDefault();
            if (e.target instanceof HTMLElement) e.target.focus();
          }}
          className="fixed inset-y-2 right-2 z-(--z-modal) flex w-[calc(100%-1rem)] max-w-sm animate-drawer-in flex-col overflow-y-auto scroll-in-radius overscroll-contain rounded-4xl border border-line bg-card p-3 pb-0 shadow-popover focus:outline-none motion-reduce:animate-none"
        >
          <div className="hero-card flex items-start gap-3 rounded-3xl p-4">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                Filtry i sortowanie
              </Dialog.Title>
              <Dialog.Description className="text-sm text-on-hero-soft">
                {active === 0
                  ? 'Zawęź listy zadań.'
                  : `Aktywne filtry: ${active}.`}
              </Dialog.Description>
            </div>
            <Dialog.Close
              data-e2e="time:modal-close:filters"
              aria-label="Zamknij"
              className="grid size-8 shrink-0 place-items-center rounded-full text-on-hero-soft transition-colors hover:bg-hero-track focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-1 pt-4">
            <ClearableInput
              type="search"
              data-e2e="time:filter-query"
              aria-label="Szukaj w zadaniach"
              placeholder="Szukaj w nazwie i opisie"
              value={filters.query}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
            />
            <Group label="Status">
              {STATUS_FILTERS.map((status) => (
                <Chip
                  key={status}
                  pressed={filters.statuses.includes(status)}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      statuses: STATUS_FILTERS.filter((item) =>
                        toggled(filters.statuses, status).includes(item),
                      ),
                    })
                  }
                >
                  {STATUS_LABELS[status]}
                </Chip>
              ))}
            </Group>
            <Group label="Kategoria">
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  pressed={filters.categoryIds.includes(category.id)}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      categoryIds: toggled(filters.categoryIds, category.id),
                    })
                  }
                >
                  <Mark
                    pressed={filters.categoryIds.includes(category.id)}
                    style={{ color: category.color }}
                  >
                    <CategoryIcon id={category.icon} className="size-4" />
                  </Mark>
                  {category.name}
                </Chip>
              ))}
            </Group>
            <Group label="Priorytet">
              {priorities.map((priority) => (
                <Chip
                  key={priority.id}
                  pressed={filters.priorityIds.includes(priority.id)}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      priorityIds: toggled(filters.priorityIds, priority.id),
                    })
                  }
                >
                  <Mark
                    pressed={filters.priorityIds.includes(priority.id)}
                    className={cn(
                      'px-1.5',
                      PRIORITY_TONE[priorityLevel(priority.value)],
                      filters.priorityIds.includes(priority.id) && 'bg-card',
                    )}
                  >
                    <PriorityMeter value={priority.value} />
                  </Mark>
                  {priority.name}
                </Chip>
              ))}
            </Group>
            <Radios
              label="Pora dnia"
              options={TIMING_FILTERS}
              labels={TIMING_LABELS}
              value={filters.timing}
              onChange={(timing) => setFilters({ ...filters, timing })}
            />
            <Radios
              label="Powtarzanie"
              options={RECURRING_FILTERS}
              labels={RECURRING_LABELS}
              value={filters.recurring}
              onChange={(recurring) => setFilters({ ...filters, recurring })}
            />
            <Radios
              label="Sortuj według"
              options={TASK_SORTS}
              labels={SORT_LABELS}
              value={filters.sort}
              onChange={(sort) => setFilters({ ...filters, sort })}
            />
          </div>
          <div className="sticky bottom-0 -mx-3 mt-auto flex gap-2 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <Button
              variant="ghost"
              data-e2e="time:filters-clear"
              disabled={!dirty}
              onClick={() => setFilters(NO_FILTERS)}
              className="flex-1 disabled:opacity-50"
            >
              <RotateCcw className="size-4" aria-hidden="true" /> Wyczyść
            </Button>
            <Button
              data-e2e="time:filters-apply"
              onClick={() => closeModal(modal)}
              className="flex-1"
            >
              {`Pokaż zadania: ${visibleTasks.length}`}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
