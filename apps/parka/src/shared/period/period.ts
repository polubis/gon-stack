import { localDay, today } from '@/shared/date/date';

/** Calendar span the dashboard shows. Days are `YYYY-MM-DD`, both ends inclusive. */
export type PeriodKind = 'day' | 'week' | 'month' | 'year' | 'custom';

export type Period = { kind: PeriodKind; from: string; to: string };

export const PERIOD_KINDS: readonly PeriodKind[] = [
  'day',
  'week',
  'month',
  'year',
  'custom',
];

/** Days a custom range shows when it is first chosen. */
const CUSTOM_DEFAULT_DAYS = 7;

/** Longest custom range, in days; longer ones are cut to it. */
export const CUSTOM_MAX_DAYS = 366 * 5;

const DAY_MS = 86_400_000;
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value: number): string => String(value).padStart(2, '0');

const toDate = (day: string): Date => {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const toDay = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const monthStart = (year: number, monthIndex: number): string =>
  toDay(new Date(Date.UTC(year, monthIndex, 1)));

const monthEnd = (year: number, monthIndex: number): string =>
  toDay(new Date(Date.UTC(year, monthIndex + 1, 0)));

export const isDay = (value: string): boolean =>
  DAY_PATTERN.test(value) && toDay(toDate(value)) === value;

export const addDays = (day: string, count: number): string =>
  toDay(new Date(toDate(day).getTime() + count * DAY_MS));

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export const daysBetween = (from: string, to: string): number =>
  Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY_MS);

/** Today as `YYYY-MM-DD` in `timeZone` (default: the local one). */
export const todayDay = (timeZone?: string): string => today(timeZone);

/** Own range from `from` to `to`, both inclusive; a swapped pair is fixed. */
export const customPeriod = (from: string, to: string): Period => {
  const [start, end] = from <= to ? [from, to] : [to, from];
  const last = addDays(start, CUSTOM_MAX_DAYS - 1);
  return { kind: 'custom', from: start, to: end > last ? last : end };
};

/** The period of `kind` that contains `day`; weeks start on Monday. */
export const periodContaining = (kind: PeriodKind, day: string): Period => {
  const date = toDate(day);
  switch (kind) {
    case 'day':
      return { kind, from: day, to: day };
    case 'custom':
      return customPeriod(addDays(day, 1 - CUSTOM_DEFAULT_DAYS), day);
    case 'week': {
      const offset = (date.getUTCDay() + 6) % 7;
      const from = addDays(day, -offset);
      return { kind, from, to: addDays(from, 6) };
    }
    case 'month': {
      const y = date.getUTCFullYear();
      const m = date.getUTCMonth();
      return { kind, from: monthStart(y, m), to: monthEnd(y, m) };
    }
    case 'year': {
      const y = date.getUTCFullYear();
      return { kind, from: monthStart(y, 0), to: monthEnd(y, 11) };
    }
  }
};

/** Period of `kind`, a custom one reading its own `to` (else a default span). */
export const resolvePeriod = (
  kind: PeriodKind,
  from: string,
  to?: string,
): Period =>
  kind === 'custom' && to
    ? customPeriod(from, to)
    : periodContaining(kind, from);

export const currentPeriod = (kind: PeriodKind, today: string): Period =>
  periodContaining(kind, today);

/** Moves `steps` periods of the same kind (negative goes back in time). */
export const shiftPeriod = (period: Period, steps: number): Period => {
  const date = toDate(period.from);
  switch (period.kind) {
    case 'custom': {
      const span = periodDays(period);
      return customPeriod(
        addDays(period.from, steps * span),
        addDays(period.to, steps * span),
      );
    }
    case 'day':
      return periodContaining('day', addDays(period.from, steps));
    case 'week':
      return periodContaining('week', addDays(period.from, steps * 7));
    case 'month':
      return periodContaining(
        'month',
        monthStart(date.getUTCFullYear(), date.getUTCMonth() + steps),
      );
    case 'year':
      return periodContaining(
        'year',
        monthStart(date.getUTCFullYear() + steps, 0),
      );
  }
};

/** Next is only possible while the period has not reached the present. */
export const canGoNext = (period: Period, today: string): boolean =>
  period.to < today;

/**
 * Periods the user is most likely to open next, nearest first: one step back
 * and forward (two for a day). Past `today` only when `allowFuture`.
 */
export const neighbourPeriods = (
  period: Period,
  today: string,
  allowFuture: boolean,
): Period[] => {
  if (period.kind === 'custom') return [];
  const reach = period.kind === 'day' ? 2 : 1;
  const steps = Array.from({ length: reach }, (_, i) => i + 1).flatMap((n) => [
    -n,
    n,
  ]);
  return steps
    .map((step) => shiftPeriod(period, step))
    .filter((next) => allowFuture || next.from <= today);
};

/** Nothing lives in the future: such a period snaps to the present one. */
export const clampPeriod = (period: Period, today: string): Period => {
  if (period.from > today) return currentPeriod(period.kind, today);
  return period.kind === 'custom' && period.to > today
    ? { ...period, to: today }
    : period;
};

export const containsDay = (period: Period, day: string): boolean =>
  day >= period.from && day <= period.to;

/** `YYYY-MM-DD` or an instant (read in `timeZone`), tested against the period. */
export const containsDate = (
  period: Period,
  iso: string,
  timeZone?: string,
): boolean => containsDay(period, localDay(iso, timeZone));

/** Months (`YYYY-MM`) the period touches, oldest first. */
export const periodMonths = (period: Period): string[] => {
  const months: string[] = [];
  let cursor = period.from.slice(0, 7);
  const last = period.to.slice(0, 7);
  while (cursor <= last) {
    months.push(cursor);
    const [y, m] = cursor.split('-').map(Number);
    cursor = monthStart(y, m).slice(0, 7);
  }
  return months;
};

/** Chart granularity: a year is read month by month, the rest day by day. */
export type Bucket = 'day' | 'month';

/** Number of whole days the period spans. */
export const periodDays = (period: Period): number =>
  daysBetween(period.from, period.to) + 1;

/** A custom range longer than this is read month by month. */
const CUSTOM_DAILY_DAYS = 92;

export const bucketOf = (period: Period): Bucket =>
  period.kind === 'year' ||
  (period.kind === 'custom' && periodDays(period) > CUSTOM_DAILY_DAYS)
    ? 'month'
    : 'day';

/** Day `index` of ISO week 1: Monday of the week holding 4 January. */
const isoWeekOneStart = (year: number): string =>
  periodContaining('week', `${year}-01-04`).from;

/** ISO week-year and number of the week that holds `day`, e.g. `2026-W41`. */
const isoWeekOf = (day: string): { year: number; week: number } => {
  const thursday = addDays(periodContaining('week', day).from, 3);
  const year = Number(thursday.slice(0, 4));
  return {
    year,
    week: Math.floor(daysBetween(isoWeekOneStart(year), thursday) / 7) + 1,
  };
};

/** Value of the matching native input (`date`, `week`, `month`, year number). */
export const toInputValue = (period: Period): string => {
  switch (period.kind) {
    case 'day':
      return period.from;
    case 'week': {
      const { year, week } = isoWeekOf(period.from);
      return `${year}-W${pad(week)}`;
    }
    case 'month':
      return period.from.slice(0, 7);
    case 'year':
      return period.from.slice(0, 4);
    case 'custom':
      return `${period.from}..${period.to}`;
  }
};

/** Period an input value stands for, or `null` for an empty or bad value. */
export const fromInputValue = (
  kind: PeriodKind,
  value: string,
): Period | null => {
  switch (kind) {
    case 'day':
      return isDay(value) ? periodContaining('day', value) : null;
    case 'week': {
      const match = /^(\d{4})-W(\d{2})$/.exec(value);
      if (!match) return null;
      const start = addDays(
        isoWeekOneStart(Number(match[1])),
        (Number(match[2]) - 1) * 7,
      );
      return periodContaining('week', start);
    }
    case 'month':
      return /^\d{4}-\d{2}$/.test(value) && isDay(`${value}-01`)
        ? periodContaining('month', `${value}-01`)
        : null;
    case 'year':
      return /^\d{4}$/.test(value)
        ? periodContaining('year', `${value}-01-01`)
        : null;
    case 'custom': {
      const [from = '', to = ''] = value.split('..');
      return isDay(from) && isDay(to) ? customPeriod(from, to) : null;
    }
  }
};

/** Latest value the input may take: the present period of the kind. */
export const maxInputValue = (kind: PeriodKind, today: string): string =>
  toInputValue(currentPeriod(kind, today));

const daysInMonth = (month: string): number => {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
};

/**
 * A monthly limit scaled to `period`: every day carries its month's share
 * (monthly / days in that month), so a month gives the limit itself, a week
 * spanning two months mixes both shares and a year gives twelve months.
 */
export const limitForPeriod = (monthly: number, period: Period): number => {
  const total = periodMonths(period).reduce((sum, month) => {
    const first = `${month}-01`;
    const last = `${month}-${pad(daysInMonth(month))}`;
    const from = period.from > first ? period.from : first;
    const to = period.to < last ? period.to : last;
    const days = daysBetween(from, to) + 1;
    return sum + (monthly * days) / daysInMonth(month);
  }, 0);
  return Math.round(total * 100) / 100;
};
