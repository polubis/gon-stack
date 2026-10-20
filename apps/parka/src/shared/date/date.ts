/**
 * The one place for date handling. Instants are stored as UTC ISO strings;
 * every "day" or "month" a person sees is read in their time zone. A calendar
 * date without time (`YYYY-MM-DD`, e.g. a recurring payment day) is a plain
 * day: it never shifts between zones.
 */

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const formatters = new Map<string, Intl.DateTimeFormat>();

const partsOf = (date: Date, timeZone: string | undefined) => {
  const key = timeZone ?? '';
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    formatters.set(key, formatter);
  }
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  return parts as Record<'year' | 'month' | 'day' | 'hour' | 'minute', string>;
};

export const isTimeZone = (value: string): boolean => {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

/** Time zone of the running browser (the server runs in UTC). */
export const browserTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Day (`YYYY-MM-DD`) an instant falls on in `timeZone` (default: the local
 * one). A plain `YYYY-MM-DD` is returned unchanged.
 */
export const localDay = (value: string | Date, timeZone?: string): string => {
  if (typeof value === 'string' && DAY_PATTERN.test(value)) return value;
  const { year, month, day } = partsOf(new Date(value), timeZone);
  return `${year}-${month}-${day}`;
};

/** Month (`YYYY-MM`) an instant falls in, in `timeZone` (default: local). */
export const localMonth = (value: string | Date, timeZone?: string): string =>
  localDay(value, timeZone).slice(0, 7);

/** Hour of day (0-23) an instant falls on in `timeZone` (default: local). */
export const localHour = (value: Date, timeZone?: string): number =>
  Number(partsOf(value, timeZone).hour);

/** Today (`YYYY-MM-DD`) in `timeZone` (default: local). */
export const today = (timeZone?: string): string =>
  localDay(new Date(), timeZone);

/** Instant → local `YYYY-MM-DDTHH:mm`, the value of a `datetime-local` input. */
export const toDateTimeInput = (value: string | Date): string => {
  const { year, month, day, hour, minute } = partsOf(
    new Date(value),
    undefined,
  );
  return `${year}-${month}-${day}T${hour}:${minute}`;
};

/** Current moment as a `datetime-local` value: the form's default. */
export const nowDateTimeInput = (now: Date = new Date()): string =>
  toDateTimeInput(now);

/** Local `YYYY-MM-DDTHH:mm` → UTC ISO instant; `null` for an empty/bad value. */
export const fromDateTimeInput = (value: string): string | null => {
  if (!DATE_TIME_PATTERN.test(value)) return null;
  const [date = '', time = ''] = value.split('T');
  const [y = 0, m = 0, d = 0] = date.split('-').map(Number);
  const [h = 0, min = 0] = time.split(':').map(Number);
  const local = new Date(y, m - 1, d, h, min);
  // Overflowing parts (month 13, hour 99) roll over: such a value is invalid.
  return Number.isNaN(local.getTime()) || toDateTimeInput(local) !== value
    ? null
    : local.toISOString();
};

/**
 * Plain day → instant on that local day at the current local time of day
 * (never midnight UTC). Anything that is not a plain day is returned as is.
 */
export const dayAtCurrentTime = (
  value: string,
  now: Date = new Date(),
): string => {
  if (!DAY_PATTERN.test(value)) return value;
  const [y = 0, m = 0, d = 0] = value.split('-').map(Number);
  return new Date(
    y,
    m - 1,
    d,
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  ).toISOString();
};

/** Plain day → instant of that local day's start. */
export const dayStart = (day: string): string => {
  const [y = 0, m = 0, d = 0] = day.split('-').map(Number);
  return new Date(y, m - 1, d).toISOString();
};
