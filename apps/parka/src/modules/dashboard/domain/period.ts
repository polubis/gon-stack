import {
  bucketOf,
  clampPeriod,
  currentPeriod,
  isDay,
  periodContaining,
  resolvePeriod,
  PERIOD_KINDS,
  type Period,
  type PeriodKind,
} from '@/shared/period/period';
import {
  dayLabel,
  monthLabel,
  monthNameLabel,
  rangeLabel,
  weekdayLabel,
} from '@/shared/date/date';

const asDate = (day: string): Date => new Date(`${day}T00:00:00.000Z`);

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Heading of a period, weekday and month named: `wtorek, 14 października 2026`,
 * `Tydzień pon. 5 – niedz. 11 paź 2026`, `Październik 2026`, `2026`.
 */
export const periodTitle = (period: Period): string => {
  switch (period.kind) {
    case 'day':
      return dayLabel(period.from, 'long');
    case 'week':
      return `Tydzień ${rangeLabel(period.from, period.to)}`;
    case 'month':
      return capitalize(monthLabel(period.from.slice(0, 7)));
    case 'year':
      return period.from.slice(0, 4);
    case 'custom':
      return rangeLabel(period.from, period.to);
  }
};

/** Day of a chart bucket (`index` is 1-based), or a day of the month it covers. */
const pointDay = (period: Period, index: number): string => {
  const date = asDate(period.from);
  if (bucketOf(period) === 'month') {
    date.setUTCMonth(date.getUTCMonth() + index - 1);
  } else {
    date.setUTCDate(date.getUTCDate() + index - 1);
  }
  return date.toISOString().slice(0, 10);
};

/** Full label of a bucket: `pon. 14 paź 2026` for a day, `Paź 2026` for a month. */
export const pointTitle = (period: Period, index: number): string => {
  const day = pointDay(period, index);
  return bucketOf(period) === 'month'
    ? capitalize(monthLabel(day.slice(0, 7), 'short'))
    : dayLabel(day);
};

/**
 * Compact axis label: `Paź` for a month, `pon. 14` in a week, `14 paź` for
 * other days.
 */
export const pointLabel = (period: Period, index: number): string => {
  const day = pointDay(period, index);
  const month = Number(day.slice(5, 7)) - 1;
  if (bucketOf(period) === 'month')
    return capitalize(monthNameLabel(month, 'short'));
  const date = Number(day.slice(8));
  return period.kind === 'week'
    ? `${weekdayLabel(day)} ${date}`
    : `${date} ${monthNameLabel(month, 'short')}`;
};

/** Buckets that get an axis label; the rest stay readable via the table. */
export const labelledPoints = (kind: PeriodKind, length: number): number[] => {
  const wanted: Record<PeriodKind, number[]> = {
    day: [1],
    week: [1, 2, 3, 4, 5, 6, 7],
    month: [1, 7, 14, 21, 28],
    year: [1, 3, 5, 7, 9, 11],
    custom: Array.from({ length: Math.min(length, 6) }, (_, i) =>
      Math.round(1 + (i * (length - 1)) / Math.max(1, Math.min(length, 6) - 1)),
    ),
  };
  return wanted[kind].filter((index) => index <= length);
};

/** Wording for the hero: what the headline total covers. */
export const PERIOD_NOUN: Record<PeriodKind, string> = {
  day: 'w tym dniu',
  week: 'w tym tygodniu',
  month: 'w tym miesiącu',
  year: 'w tym roku',
  custom: 'w wybranym okresie',
};

/** What a scaled limit covers: `Limit na tydzień`. */
export const LIMIT_NOUN: Record<PeriodKind, string> = {
  day: 'dzień',
  week: 'tydzień',
  month: 'miesiąc',
  year: 'rok',
  custom: 'okres',
};

/** Page query for `period`: a month keeps the legacy `?month=` link shape. */
export const periodToQuery = (period: Period): Record<string, string> =>
  period.kind === 'month'
    ? { month: period.from.slice(0, 7) }
    : period.kind === 'custom'
      ? { range: 'custom', from: period.from, to: period.to }
      : { range: period.kind, from: period.from };

/** Reads the period from page query values; bad or future input snaps to now. */
export const periodFromQuery = (
  query: {
    month: string | null;
    range: string | null;
    from: string | null;
    to: string | null;
  },
  today: string,
): Period => {
  const kind = PERIOD_KINDS.find((k) => k === query.range);
  if (kind && query.from && isDay(query.from)) {
    const to = query.to && isDay(query.to) ? query.to : undefined;
    return clampPeriod(resolvePeriod(kind, query.from, to), today);
  }
  if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
    const day = `${query.month}-01`;
    if (isDay(day)) return clampPeriod(periodContaining('month', day), today);
  }
  return currentPeriod('month', today);
};
