import * as Popover from '@radix-ui/react-popover';
import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import type { Catalog, CatalogId } from '../domain/models';

const STEP_BUTTON =
  'pressable grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-card text-ink shadow-card hover:bg-brand-softer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const OPTION =
  'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** The catalog `step` places away, round and round: neither end ever stops. */
export const cycleCatalog = (
  catalogs: readonly Catalog[],
  current: CatalogId | null,
  step: 1 | -1,
): CatalogId | null => {
  if (catalogs.length === 0) return null;
  const at = catalogs.findIndex((c) => c.id === current);
  return catalogs[(Math.max(at, 0) + step + catalogs.length) % catalogs.length]!
    .id;
};

/**
 * Picks the catalog the screen shows: arrows step to the next or previous
 * one, round and round (never disabled), the middle opens the full list.
 */
export const CatalogPicker = ({
  catalogs,
  catalog,
  onStep,
  onPick,
}: {
  catalogs: readonly Catalog[];
  catalog: Catalog | null;
  onStep: (by: 1 | -1) => void;
  onPick: (id: CatalogId) => void;
}) => {
  const { open, setOpen } = usePopoverOpen('knowledge:catalog-picker');
  return (
    <div
      role="group"
      aria-label="Katalog"
      className="mx-auto flex w-full max-w-sm items-center gap-2 p-1"
    >
      <button
        type="button"
        data-e2e="knowledge:catalog-prev"
        aria-label="Poprzedni katalog"
        onClick={() => onStep(-1)}
        className={STEP_BUTTON}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <Popover.Root modal open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          data-e2e="knowledge:catalog-picker"
          aria-label={`Wybierz katalog: ${catalog?.name ?? 'brak'}`}
          className="pressable flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-semibold shadow-card hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span
            data-e2e="knowledge:catalog-label"
            aria-hidden="true"
            className="truncate"
          >
            {catalog?.name ?? 'Brak katalogów'}
          </span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-soft"
            aria-hidden="true"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="center"
            sideOffset={4}
            collisionPadding={16}
            className="z-(--z-popover) w-(--radix-popper-anchor-width) min-w-56 rounded-2xl border border-line bg-card p-2 shadow-popover focus:outline-none"
          >
            <ul
              aria-label="Katalogi"
              className="max-h-64 space-y-1 overflow-y-auto overscroll-contain py-1 pr-2 pl-1"
            >
              {catalogs.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    data-e2e={`knowledge:catalog-option:${c.id}`}
                    aria-pressed={c.id === catalog?.id}
                    onClick={() => {
                      onPick(c.id);
                      setOpen(false);
                    }}
                    className={cn(
                      OPTION,
                      c.id === catalog?.id &&
                        'bg-brand-soft font-semibold text-brand',
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    {c.id === catalog?.id && (
                      <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <button
        type="button"
        data-e2e="knowledge:catalog-next"
        aria-label="Następny katalog"
        onClick={() => onStep(1)}
        className={STEP_BUTTON}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};
