import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { RotateCcw, X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import { ClearableInput } from '@/shared/ui/clearable';
import { Button } from '@/shared/ui/controls';
import { QUERY_MAX_LENGTH } from '../configuration/constraints';
import {
  activeFilterCount,
  NO_FILTERS,
  PROGRESS_FILTERS,
  PROGRESS_LABELS,
  SORT_LABELS,
  SORTS,
} from '../domain/filters';
import { useContext } from './context';

const CHIP =
  'pressable inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-brand';

const chipTone = (on: boolean) =>
  on
    ? 'border-brand bg-brand text-on-brand'
    : 'border-line bg-card text-ink hover:bg-brand-softer';

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

/** Single choice that can be switched off again: pressing the chosen chip clears it. */
const Toggle = ({
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
    className={cn(CHIP, chipTone(pressed))}
  >
    {children}
  </button>
);

/** Exactly one radio on. */
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
          className={cn(CHIP, chipTone(option === value))}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Filters and sorting, in the look of the account drawer. Lives in the URL
 * modal stack; every choice is written to the query params at once, so the
 * lists change behind it and a link restores the same view.
 */
export const FiltersDrawer = ({ modal }: { modal: string }) => {
  const { filters, setFilters, categories, catalogs, tags, topics, backlog } =
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
          data-e2e="knowledge:filters-drawer"
          onOpenAutoFocus={(e) => {
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
                  ? 'Zawęź listy tematów.'
                  : `Aktywne filtry: ${active}.`}
              </Dialog.Description>
            </div>
            <Dialog.Close
              data-e2e="knowledge:modal-close:filters"
              aria-label="Zamknij"
              className="grid size-8 shrink-0 place-items-center rounded-full text-on-hero-soft transition-colors hover:bg-hero-track focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="flex flex-1 flex-col gap-4 px-1 pt-4">
            <ClearableInput
              type="search"
              data-e2e="knowledge:filter-query"
              aria-label="Szukaj w tematach"
              placeholder="Szukaj w tytule i opisie"
              maxLength={QUERY_MAX_LENGTH}
              value={filters.query}
              onChange={(e) =>
                setFilters({ ...filters, query: e.target.value })
              }
            />
            <Group label="Kategoria">
              {categories.map((category) => (
                <Toggle
                  key={category.id}
                  pressed={filters.categoryId === category.id}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      categoryId:
                        filters.categoryId === category.id ? null : category.id,
                    })
                  }
                >
                  <span
                    aria-hidden="true"
                    className="mr-2 size-2.5 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </Toggle>
              ))}
            </Group>
            <Group label="Katalog">
              {catalogs.map((catalog) => (
                <Toggle
                  key={catalog.id}
                  pressed={filters.catalogId === catalog.id}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      catalogId:
                        filters.catalogId === catalog.id ? null : catalog.id,
                    })
                  }
                >
                  {catalog.name}
                </Toggle>
              ))}
            </Group>
            <Group label="Tag">
              {tags.map((tag) => (
                <Toggle
                  key={tag.id}
                  pressed={filters.tagId === tag.id}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      tagId: filters.tagId === tag.id ? null : tag.id,
                    })
                  }
                >
                  {tag.name}
                </Toggle>
              ))}
            </Group>
            <Radios
              label="Postęp"
              options={PROGRESS_FILTERS}
              labels={PROGRESS_LABELS}
              value={filters.progress}
              onChange={(progress) => setFilters({ ...filters, progress })}
            />
            <Radios
              label="Sortuj według"
              options={SORTS}
              labels={SORT_LABELS}
              value={filters.sort}
              onChange={(sort) => setFilters({ ...filters, sort })}
            />
          </div>
          <div className="sticky bottom-0 -mx-3 mt-auto flex gap-2 bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <Button
              variant="ghost"
              data-e2e="knowledge:filters-clear"
              disabled={!dirty}
              onClick={() => setFilters(NO_FILTERS)}
              className="flex-1 disabled:opacity-50"
            >
              <RotateCcw className="size-4" aria-hidden="true" /> Wyczyść
            </Button>
            <Button
              data-e2e="knowledge:filters-apply"
              onClick={() => closeModal(modal)}
              className="flex-1"
            >
              {`Pokaż tematy: ${topics.length + backlog.length}`}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
