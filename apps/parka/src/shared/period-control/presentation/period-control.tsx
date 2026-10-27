import { type KeyboardEvent, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarRange, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { useModal } from '@/shared/router/modal-stack';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import {
  canGoNext,
  clampPeriod,
  currentPeriod,
  fromInputValue,
  maxInputValue,
  PERIOD_KINDS,
  shiftPeriod,
  toInputValue,
  type Period,
  type PeriodKind,
} from '@/shared/period/period';
import { PERIOD_RANGE_MODAL } from '../configuration/constraints';
import {
  PERIOD_KIND_LABELS,
  periodLabel,
  pickerOptions,
} from '../domain/format';

const STEP_BUTTON =
  'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line-strong bg-card text-ink transition-colors hover:bg-hover-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const SEGMENT =
  'relative flex h-full items-center justify-center transition-colors hover:bg-hover-soft focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const PANEL =
  'z-(--z-modal) rounded-xl border border-line-strong bg-card p-2 shadow-lg focus:outline-none';

const OPTION =
  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const JUMP_LABEL = {
  day: 'Wybierz dzień',
  week: 'Wybierz tydzień',
  month: 'Wybierz miesiąc',
  year: 'Wybierz rok',
  custom: 'Wybierz przedział',
} as const;

/** Arrow, Home and End keys move focus between the options of a list. */
const moveFocus = (e: KeyboardEvent<HTMLElement>) => {
  const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const items = [...e.currentTarget.querySelectorAll('button')];
  const at = items.indexOf(document.activeElement as HTMLButtonElement);
  const target =
    e.key === 'Home'
      ? 0
      : e.key === 'End'
        ? items.length - 1
        : Math.min(
            items.length - 1,
            Math.max(0, at + (e.key === 'ArrowDown' ? 1 : -1)),
          );
  e.preventDefault();
  items[target]?.focus();
};

/** Centers the chosen option inside its own list; the page never scrolls. */
const centerSelected = (list: HTMLElement | null) => {
  const chosen = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if (!list || !chosen) return;
  list.scrollTop =
    chosen.offsetTop - list.clientHeight / 2 + chosen.clientHeight / 2;
};

/** Focus lands on the chosen option, without scrolling the page. */
const focusChosen = (e: Event) => {
  const chosen = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(
    '[aria-pressed="true"]',
  );
  if (!chosen) return;
  e.preventDefault();
  chosen.focus({ preventScroll: true });
};

/**
 * The picker that fits the kind: a date field for a day, a list of periods
 * (later than the present only when `allowFuture`) for a week, month or year.
 */
const PeriodChoices = ({
  period,
  today,
  allowFuture,
  onPick,
}: {
  period: Period;
  today: string;
  allowFuture: boolean;
  onPick: (period: Period) => void;
}) => {
  const value = toInputValue(period);
  const pick = (raw: string) => {
    const next = fromInputValue(period.kind, raw);
    if (next) onPick(allowFuture ? next : clampPeriod(next, today));
  };

  // An own range is picked in its modal, never in the popover.
  if (period.kind === 'custom') return null;

  if (period.kind === 'day') {
    return (
      <input
        data-e2e="period-control:day"
        type="date"
        aria-label={JUMP_LABEL.day}
        value={value}
        max={allowFuture ? undefined : maxInputValue('day', today)}
        onChange={(e) => pick(e.target.value)}
        className="h-11 w-full rounded-lg border border-line-strong bg-card px-3 text-sm [color-scheme:light_dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      />
    );
  }

  return (
    <ul
      aria-label={JUMP_LABEL[period.kind]}
      ref={centerSelected}
      onKeyDown={moveFocus}
      className="relative max-h-64 space-y-1 overflow-y-auto overscroll-contain py-1 pr-2 pl-1"
    >
      {pickerOptions(period, today, allowFuture).map((option) => {
        const selected = option.value === value;
        return (
          <li key={option.value}>
            <button
              type="button"
              data-e2e={`period-control:option:${option.value}`}
              aria-pressed={selected}
              onClick={() => pick(option.value)}
              className={cn(
                OPTION,
                selected && 'bg-brand-soft font-semibold text-brand',
              )}
            >
              {option.label}
              {selected && <Check className="h-4 w-4" aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
};

type Props = {
  period: Period;
  today: string;
  onChange: (period: Period) => void;
  /** Forward and the pickers reach past `today`. Default: only up to today. */
  allowFuture?: boolean;
  /**
   * Own-range popup. Giving it adds the "Własny" kind; the control opens it
   * through the URL modal stack (`PERIOD_RANGE_MODAL`) while the period is
   * custom. Without it the kinds are day, week, month and year.
   */
  renderRange?: (range: {
    period: Period;
    today: string;
    onPick: (period: Period) => void;
  }) => ReactNode;
};

const KINDS_WITHOUT_RANGE: readonly PeriodKind[] = PERIOD_KINDS.filter(
  (kind) => kind !== 'custom',
);

/**
 * Picks the covered period: steps back and forward in the arrows and,
 * between them, the active period (three quarters) split from a range icon
 * (one quarter). The period opens the picker of its kind, the icon lists the
 * kinds and "Dziś". Shared by finance and tasks; the scope state stays in the
 * consumer.
 */
export const PeriodControl = ({
  period,
  today,
  onChange,
  allowFuture = false,
  renderRange,
}: Props) => {
  const { open: valueOpen, setOpen: setValueOpen } = usePopoverOpen(
    'period-control:value',
  );
  const { open: kindOpen, setOpen: setKindOpen } = usePopoverOpen(
    'period-control:kind',
  );
  const range = useModal(PERIOD_RANGE_MODAL);
  const own = period.kind === 'custom';
  const next = allowFuture || canGoNext(period, today);
  const kinds = renderRange ? PERIOD_KINDS : KINDS_WITHOUT_RANGE;
  const fit = (value: Period) =>
    allowFuture ? value : clampPeriod(value, today);

  return (
    <div
      role="group"
      aria-label="Zakres czasu"
      className="mx-auto flex w-full max-w-sm items-center gap-2 p-1"
    >
      <button
        type="button"
        data-e2e="period-control:prev"
        aria-label="Poprzedni okres"
        onClick={() => onChange(shiftPeriod(period, -1))}
        className={STEP_BUTTON}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <Popover.Root
        open={valueOpen && !own}
        onOpenChange={(open) => {
          if (own) {
            if (open) range.open();
            return;
          }
          setValueOpen(open);
        }}
      >
        <Popover.Anchor asChild>
          <div className="flex h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-card text-sm font-semibold">
            <Popover.Trigger
              data-e2e="period-control:value"
              aria-label={`${JUMP_LABEL[period.kind]}: ${periodLabel(period)}`}
              className={cn(SEGMENT, 'min-w-0 basis-3/4 rounded-l-xl px-2')}
            >
              <span
                data-e2e="period-control:label"
                className="line-clamp-2 text-center leading-tight tabular-nums"
                aria-hidden="true"
              >
                {periodLabel(period)}
              </span>
            </Popover.Trigger>

            <Popover.Root open={kindOpen} onOpenChange={setKindOpen}>
              <Popover.Trigger
                data-e2e="period-control:kind"
                aria-label={`Zakres: ${PERIOD_KIND_LABELS[period.kind]}`}
                className={cn(
                  SEGMENT,
                  'basis-1/4 rounded-r-xl border-l border-line-strong',
                )}
              >
                <CalendarRange
                  className="h-5 w-5 text-ink-soft"
                  aria-hidden="true"
                />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  onOpenAutoFocus={focusChosen}
                  onKeyDown={moveFocus}
                  align="end"
                  sideOffset={4}
                  collisionPadding={16}
                  className={cn(PANEL, 'w-44')}
                >
                  <ul aria-label="Zakres" className="space-y-1">
                    {kinds.map((kind) => (
                      <li key={kind}>
                        <button
                          type="button"
                          data-e2e={`period-control:preset:${kind}`}
                          aria-pressed={kind === period.kind}
                          onClick={() => {
                            if (kind !== period.kind)
                              onChange(currentPeriod(kind, today));
                            setKindOpen(false);
                            if (kind === 'custom') range.open();
                          }}
                          className={cn(
                            OPTION,
                            kind === period.kind &&
                              'bg-brand-soft font-semibold text-brand',
                          )}
                        >
                          {PERIOD_KIND_LABELS[kind]}
                          {kind === period.kind && (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    data-e2e="period-control:today"
                    onClick={() => {
                      onChange(currentPeriod(period.kind, today));
                      setKindOpen(false);
                    }}
                    className={cn(OPTION, 'mt-1 border-t border-line pt-2')}
                  >
                    Dziś
                  </button>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            onOpenAutoFocus={focusChosen}
            data-e2e="period-control:jump"
            align="center"
            sideOffset={4}
            collisionPadding={16}
            className={cn(PANEL, 'w-(--radix-popper-anchor-width) min-w-56')}
          >
            <PeriodChoices
              period={period}
              today={today}
              allowFuture={allowFuture}
              onPick={(picked) => {
                onChange(picked);
                setValueOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {range.isOpen &&
        own &&
        renderRange?.({ period, today, onPick: onChange })}

      <span role="status" className="sr-only">
        {periodLabel(period)}
      </span>

      <button
        type="button"
        data-e2e="period-control:next"
        aria-label="Następny okres"
        disabled={!next}
        onClick={() => onChange(fit(shiftPeriod(period, 1)))}
        className={STEP_BUTTON}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};
