import { useState, type FormEvent, type KeyboardEvent } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { CalendarRange, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  canGoNext,
  clampPeriod,
  currentPeriod,
  customPeriod,
  isDay,
  fromInputValue,
  maxInputValue,
  PERIOD_KINDS,
  shiftPeriod,
  toInputValue,
  type Period,
} from '@/shared/period/period';
import {
  PERIOD_KIND_LABELS,
  periodTitle,
  pickerOptions,
} from '../domain/period';

const STEP_BUTTON =
  'grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line-strong bg-card text-ink transition-colors hover:bg-hover-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const SEGMENT =
  'relative flex h-full items-center justify-center transition-colors hover:bg-hover-soft focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const PANEL =
  'z-(--z-modal) rounded-xl border border-line-strong bg-card p-2 shadow-lg focus:outline-none';

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

const OPTION =
  'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const DATE_FIELD =
  'h-11 w-full rounded-lg border border-line-strong bg-card px-3 text-sm [color-scheme:light_dark] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** Own range: two date fields, applied together so half-typed dates never load. */
const CustomRange = ({
  period,
  today,
  onPick,
}: {
  period: Period;
  today: string;
  onPick: (period: Period) => void;
}) => {
  const [from, setFrom] = useState(period.from);
  const [to, setTo] = useState(period.to);
  const valid = isDay(from) && isDay(to) && from <= to;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onPick(clampPeriod(customPeriod(from, to), today));
  };

  return (
    <form
      aria-label={JUMP_LABEL.custom}
      onSubmit={submit}
      className="space-y-3 p-1"
    >
      <label className="block space-y-1 text-sm font-medium text-ink-soft">
        Od
        <input
          data-e2e="dashboard:period-from"
          type="date"
          value={from}
          max={to && to < today ? to : today}
          onChange={(e) => setFrom(e.target.value)}
          className={DATE_FIELD}
        />
      </label>
      <label className="block space-y-1 text-sm font-medium text-ink-soft">
        Do
        <input
          data-e2e="dashboard:period-to"
          type="date"
          value={to}
          min={from}
          max={today}
          onChange={(e) => setTo(e.target.value)}
          className={DATE_FIELD}
        />
      </label>
      {isDay(from) && isDay(to) && from > to && (
        <p role="alert" className="text-sm text-danger">
          Data końcowa jest przed początkową.
        </p>
      )}
      <button
        type="submit"
        data-e2e="dashboard:period-apply"
        disabled={!valid}
        className="h-11 w-full rounded-xl bg-brand px-3 text-sm font-semibold text-on-brand transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Zastosuj
      </button>
    </form>
  );
};

/**
 * The picker that fits the kind: a date field for a day, a list of periods
 * (never later than the present) for a week, month or year.
 */
const PeriodChoices = ({
  period,
  today,
  onPick,
}: {
  period: Period;
  today: string;
  onPick: (period: Period) => void;
}) => {
  const value = toInputValue(period);
  const pick = (raw: string) => {
    const next = fromInputValue(period.kind, raw);
    if (next) onPick(clampPeriod(next, today));
  };

  if (period.kind === 'custom') {
    return <CustomRange period={period} today={today} onPick={onPick} />;
  }

  if (period.kind === 'day') {
    return (
      <input
        data-e2e="dashboard:period-day"
        type="date"
        aria-label={JUMP_LABEL.day}
        value={value}
        max={maxInputValue('day', today)}
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
      {pickerOptions(period, today).map((option) => {
        const selected = option.value === value;
        return (
          <li key={option.value}>
            <button
              type="button"
              data-e2e={`dashboard:period-option:${option.value}`}
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

/**
 * Picks what the dashboard covers: steps back and forward in the arrows and,
 * between them, the active period (three quarters) split from a range icon
 * (one quarter). The period opens the picker of its kind, the icon lists the
 * kinds. Forward stops at the present.
 */
export const PeriodControl = ({
  period,
  today,
  onChange,
}: {
  period: Period;
  today: string;
  onChange: (period: Period) => void;
}) => {
  const [valueOpen, setValueOpen] = useState(false);
  const [kindOpen, setKindOpen] = useState(false);
  const next = canGoNext(period, today);

  return (
    <div
      role="group"
      aria-label="Zakres czasu"
      className="mx-auto flex w-full max-w-sm items-center gap-2 p-1"
    >
      <button
        type="button"
        data-e2e="dashboard:period-prev"
        aria-label="Poprzedni okres"
        onClick={() => onChange(shiftPeriod(period, -1))}
        className={STEP_BUTTON}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <Popover.Root open={valueOpen} onOpenChange={setValueOpen}>
        <Popover.Anchor asChild>
          <div className="flex h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-card text-sm font-semibold">
            <Popover.Trigger
              data-e2e="dashboard:period-value"
              aria-label={`${JUMP_LABEL[period.kind]}: ${periodTitle(period)}`}
              className={cn(SEGMENT, 'min-w-0 basis-3/4 rounded-l-xl px-2')}
            >
              <span
                data-e2e="dashboard:period-label"
                className="line-clamp-2 text-center leading-tight tabular-nums"
                aria-hidden="true"
              >
                {periodTitle(period)}
              </span>
            </Popover.Trigger>

            <Popover.Root open={kindOpen} onOpenChange={setKindOpen}>
              <Popover.Trigger
                data-e2e="dashboard:period-kind"
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
                  align="end"
                  sideOffset={4}
                  collisionPadding={16}
                  className={cn(PANEL, 'w-44')}
                >
                  <ul
                    aria-label="Zakres"
                    onKeyDown={moveFocus}
                    className="space-y-1"
                  >
                    {PERIOD_KINDS.map((kind) => (
                      <li key={kind}>
                        <button
                          type="button"
                          data-e2e={`dashboard:period-preset:${kind}`}
                          aria-pressed={kind === period.kind}
                          onClick={() => {
                            if (kind !== period.kind)
                              onChange(currentPeriod(kind, today));
                            setKindOpen(false);
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
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            onOpenAutoFocus={focusChosen}
            data-e2e="dashboard:period-jump"
            align="center"
            sideOffset={4}
            collisionPadding={16}
            className={cn(PANEL, 'w-(--radix-popper-anchor-width) min-w-56')}
          >
            <PeriodChoices
              period={period}
              today={today}
              onPick={(picked) => {
                onChange(picked);
                setValueOpen(false);
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <span role="status" className="sr-only">
        {periodTitle(period)}
      </span>

      <button
        type="button"
        data-e2e="dashboard:period-next"
        aria-label="Następny okres"
        disabled={!next}
        onClick={() => onChange(clampPeriod(shiftPeriod(period, 1), today))}
        className={STEP_BUTTON}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
};
