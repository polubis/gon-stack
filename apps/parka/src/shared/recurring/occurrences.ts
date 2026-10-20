export type RecurringInterval = 'weekly' | 'monthly' | 'yearly';

/**
 * When a series happens, whatever it makes (an expense, a task). Days are
 * plain calendar days (`YYYY-MM-DD`), compared as strings.
 */
export type RecurringSchedule = {
  interval: RecurringInterval;
  /** First occurrence. */
  startDate: string;
  /** Last day an occurrence may fall on; `null` = never ends. */
  endDate: string | null;
  /** Newest occurrence already materialized; `null` = none yet. */
  lastMaterializedDate: string | null;
  /** Paused rules neither create nor announce anything. */
  active: boolean;
};

/**
 * A recurring rule is an instruction, never an expense: it says when a cost
 * is due.
 */
export type RecurringRule = RecurringSchedule & {
  id: string;
  name: string;
  cost: number;
  categoryId: string | null;
};

/** Safety valve: one catch-up never creates more than this many expenses. */
export const MAX_CATCH_UP = 1000;

const DAY_MS = 86_400_000;

const toDate = (day: string): Date => {
  const [y = 0, m = 1, d = 1] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const toDay = (date: Date): string => date.toISOString().slice(0, 10);

const daysInMonth = (year: number, monthIndex: number): number =>
  new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

/** `day` moved by `months`, keeping its day of month within shorter months. */
const addMonths = (day: string, months: number): string => {
  const start = toDate(day);
  const index = start.getUTCFullYear() * 12 + start.getUTCMonth() + months;
  const year = Math.floor(index / 12);
  const month = index % 12;
  const date = Math.min(start.getUTCDate(), daysInMonth(year, month));
  return toDay(new Date(Date.UTC(year, month, date)));
};

/**
 * The `step`-th occurrence of the series, counted from the start date (always
 * from the start, so a clamped 28th of February does not drift the series).
 */
const occurrenceAt = (rule: RecurringSchedule, step: number): string => {
  switch (rule.interval) {
    case 'weekly':
      return toDay(
        new Date(toDate(rule.startDate).getTime() + step * 7 * DAY_MS),
      );
    case 'monthly':
      return addMonths(rule.startDate, step);
    case 'yearly':
      return addMonths(rule.startDate, step * 12);
    default: {
      const unreachable: never = rule.interval;
      return unreachable;
    }
  }
};

/** Occurrences from the start date on, in order, up to `limit` day (inclusive). */
function* occurrences(
  rule: RecurringSchedule,
  limit: string,
): Generator<string> {
  const last =
    rule.endDate !== null && rule.endDate < limit ? rule.endDate : limit;
  for (let step = 0; ; step++) {
    const day = occurrenceAt(rule, step);
    if (day > last) return;
    yield day;
  }
}

/**
 * Occurrences that have come due (`<= today`) and are not expenses yet: all
 * after `lastMaterializedDate`, oldest first, so an app left closed for weeks
 * catches up in one go. Nothing before `lastMaterializedDate` is ever
 * returned, which is why a deleted expense does not come back.
 */
export const dueOccurrences = (
  rule: RecurringSchedule,
  today: string,
): string[] => {
  if (!rule.active) return [];
  const due: string[] = [];
  for (const day of occurrences(rule, today)) {
    if (rule.lastMaterializedDate !== null && day <= rule.lastMaterializedDate)
      continue;
    due.push(day);
    if (due.length >= MAX_CATCH_UP) break;
  }
  return due;
};

/**
 * The next `count` occurrences after `today`: a projection, never stored and
 * never counted anywhere.
 */
export const upcomingOccurrences = (
  rule: RecurringSchedule,
  today: string,
  count = 3,
): string[] => {
  if (!rule.active) return [];
  const horizon = rule.endDate ?? '9999-12-31';
  const upcoming: string[] = [];
  for (const day of occurrences(rule, horizon)) {
    if (day <= today) continue;
    upcoming.push(day);
    if (upcoming.length >= count) break;
  }
  return upcoming;
};
