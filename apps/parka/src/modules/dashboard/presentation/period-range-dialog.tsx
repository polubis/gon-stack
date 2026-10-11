import { useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { closeModal, closeModalThen } from '@/shared/router/modal-stack';
import {
  addDays,
  clampPeriod,
  customPeriod,
  periodContaining,
  type Period,
} from '@/shared/period/period';
import { DetailDialog } from './detail-dialog';
import { PERIOD_RANGE_MODAL } from './modal-ids';

const WEEKDAYS = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'] as const;

const MONTH_TITLE = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const DAY_NAME = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const MONTH_NAME = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  timeZone: 'UTC',
});

/** How many years back the year select reaches. */
const YEARS_BACK = 20;

const MONTH_CELL =
  'grid h-11 place-items-center rounded-lg text-sm capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-30';

const TITLE_BUTTON =
  'flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 text-sm font-semibold capitalize transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const YEAR_SELECT =
  'h-10 min-w-0 flex-1 rounded-lg border border-line-strong bg-card px-2 text-center text-sm font-semibold tabular-nums text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const NAV_BUTTON =
  'grid h-10 w-10 place-items-center rounded-lg border border-line-strong bg-card text-ink transition-colors hover:bg-hover-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

const DAY_CELL =
  'grid h-10 w-full place-items-center text-sm tabular-nums transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-30';

const ARROW_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const firstOf = (month: string): string => `${month}-01`;

const shiftMonth = (month: string, steps: number): string => {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + steps, 1)).toISOString().slice(0, 7);
};

/** Every day of the month, padded with the neighbours to whole Mon-Sun weeks. */
const weeksOf = (month: string): string[][] => {
  const first = periodContaining('month', firstOf(month));
  const start = periodContaining('week', first.from).from;
  const end = periodContaining('week', first.to).to;
  const days: string[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);
  return Array.from({ length: days.length / 7 }, (_, i) =>
    days.slice(i * 7, i * 7 + 7),
  );
};

/** Two clicks make a range; a click on a finished range starts a new one. */
const nextDraft = (
  draft: { from: string; to: string },
  day: string,
): { from: string; to: string } => {
  if (!draft.from || draft.to) return { from: day, to: '' };
  return day < draft.from
    ? { from: day, to: '' }
    : { from: draft.from, to: day };
};

/**
 * Modal with a month calendar: pick the first and the last day of an own
 * range, then apply. It sits in the URL modal stack like every popup.
 */
export const PeriodRangeDialog = ({
  period,
  today,
  onPick,
}: {
  period: Period;
  today: string;
  onPick: (period: Period) => void;
}) => {
  const [draft, setDraft] = useState({ from: period.from, to: period.to });
  const [month, setMonth] = useState((period.to || today).slice(0, 7));
  const [jumping, setJumping] = useState(false);
  const [year, setYear] = useState(Number(month.slice(0, 4)));
  const titleRef = useRef<HTMLButtonElement>(null);
  const close = () => closeModal(PERIOD_RANGE_MODAL);
  const complete = draft.from !== '' && draft.to !== '';
  const lastMonth = today.slice(0, 7);
  const lastYear = Number(lastMonth.slice(0, 4));
  const years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => lastYear - i);
  if (!years.includes(year)) years.push(year);
  years.sort((a, b) => b - a);

  const toggleJump = () => {
    setYear(Number(month.slice(0, 4)));
    setJumping(!jumping);
  };

  const jumpTo = (target: string) => {
    setMonth(target);
    setJumping(false);
    titleRef.current?.focus();
  };

  const apply = () => {
    if (!complete) return;
    closeModalThen(PERIOD_RANGE_MODAL, () =>
      onPick(clampPeriod(customPeriod(draft.from, draft.to), today)),
    );
  };

  const moveDay = (e: KeyboardEvent<HTMLElement>) => {
    const step = ARROW_STEPS[e.key];
    const day = (e.target as HTMLElement).dataset.day;
    if (step === undefined || !day) return;
    const target = addDays(day, step);
    if (target > today) return;
    e.preventDefault();
    setMonth(target.slice(0, 7));
    requestAnimationFrame(() =>
      e.currentTarget
        .querySelector<HTMLElement>(`[data-day="${target}"]`)
        ?.focus(),
    );
  };

  const summary = complete
    ? `${DAY_NAME.format(new Date(draft.from))} – ${DAY_NAME.format(new Date(draft.to))}`
    : draft.from
      ? `Od ${DAY_NAME.format(new Date(draft.from))} – wybierz dzień końcowy`
      : 'Wybierz dzień początkowy';

  return (
    <DetailDialog
      modal={PERIOD_RANGE_MODAL}
      data-e2e="dashboard:period-range-dialog"
      title="Własny zakres"
      description="Wybierz dzień początkowy i końcowy."
      onClose={close}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          data-e2e="dashboard:period-range-prev"
          aria-label="Poprzedni miesiąc"
          disabled={jumping}
          onClick={() => setMonth(shiftMonth(month, -1))}
          className={NAV_BUTTON}
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          ref={titleRef}
          type="button"
          data-e2e="dashboard:period-range-month"
          aria-expanded={jumping}
          aria-controls="period-range-jump"
          aria-label={`${MONTH_TITLE.format(new Date(firstOf(month)))}, wybierz miesiąc i rok`}
          onClick={toggleJump}
          className={TITLE_BUTTON}
        >
          <span className="truncate">
            {MONTH_TITLE.format(new Date(firstOf(month)))}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none',
              jumping && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          data-e2e="dashboard:period-range-next"
          aria-label="Następny miesiąc"
          disabled={jumping || month >= lastMonth}
          onClick={() => setMonth(shiftMonth(month, 1))}
          className={NAV_BUTTON}
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {jumping ? (
        <div
          id="period-range-jump"
          role="group"
          aria-label="Wybór miesiąca i roku"
          className="min-h-73 animate-view-enter motion-reduce:animate-none"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              data-e2e="dashboard:period-range-year-prev"
              aria-label="Poprzedni rok"
              onClick={() => setYear(year - 1)}
              disabled={year <= years[years.length - 1]}
              className={NAV_BUTTON}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <select
              aria-label="Rok"
              data-e2e="dashboard:period-range-year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={YEAR_SELECT}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button
              type="button"
              data-e2e="dashboard:period-range-year-next"
              aria-label="Następny rok"
              disabled={year >= lastYear}
              onClick={() => setYear(year + 1)}
              className={NAV_BUTTON}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, i) => {
              const value = `${year}-${String(i + 1).padStart(2, '0')}`;
              return (
                <button
                  key={value}
                  type="button"
                  autoFocus={value === month}
                  data-e2e={`dashboard:period-range-month-option:${value}`}
                  aria-pressed={value === month}
                  disabled={value > lastMonth}
                  onClick={() => jumpTo(value)}
                  className={cn(
                    MONTH_CELL,
                    value === month
                      ? 'bg-brand font-semibold text-on-brand'
                      : 'hover:bg-hover-soft',
                  )}
                >
                  {MONTH_NAME.format(new Date(firstOf(value)))}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          role="group"
          aria-label="Kalendarz"
          onKeyDown={moveDay}
          className="grid min-h-73 grid-cols-7 content-start gap-y-1"
        >
          {WEEKDAYS.map((name) => (
            <span
              key={name}
              aria-hidden="true"
              className="grid h-8 place-items-center text-xs text-ink-soft"
            >
              {name}
            </span>
          ))}
          {weeksOf(month)
            .flat()
            .map((day) => {
              const edge = day === draft.from || day === draft.to;
              const inside =
                draft.from !== '' &&
                draft.to !== '' &&
                day > draft.from &&
                day < draft.to;
              return (
                <button
                  key={day}
                  type="button"
                  data-day={day}
                  data-e2e={`dashboard:period-range-day:${day}`}
                  aria-label={DAY_NAME.format(new Date(day))}
                  aria-pressed={edge}
                  disabled={day > today}
                  onClick={() => setDraft(nextDraft(draft, day))}
                  className={cn(
                    DAY_CELL,
                    day.slice(0, 7) !== month && 'text-ink-soft',
                    inside && 'bg-brand-soft text-brand',
                    edge && 'rounded-lg bg-brand font-semibold text-on-brand',
                    !edge && !inside && 'rounded-lg hover:bg-hover-soft',
                  )}
                >
                  {Number(day.slice(8))}
                </button>
              );
            })}
        </div>
      )}

      <p role="status" className="mt-3 text-sm text-ink-soft">
        {summary}
      </p>

      <button
        type="button"
        data-e2e="dashboard:period-range-apply"
        disabled={!complete}
        onClick={apply}
        className="mt-3 h-11 w-full rounded-xl bg-brand px-3 text-sm font-semibold text-on-brand transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Zastosuj
      </button>
    </DetailDialog>
  );
};
