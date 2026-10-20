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

const plLong = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const plShort = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});
const plShortYear = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const plShortMonth = new Intl.DateTimeFormat('pl-PL', {
  month: 'short',
  timeZone: 'UTC',
});
const plMonthYear = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const asDate = (day: string): Date => new Date(`${day}T00:00:00.000Z`);

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

/** `2026-10-05..11` week → `5–11 października 2026`. */
export const periodTitle = (period: Period): string => {
  switch (period.kind) {
    case 'day':
      return plLong.format(asDate(period.from));
    case 'week': {
      const sameMonth = period.from.slice(0, 7) === period.to.slice(0, 7);
      const start = sameMonth
        ? String(Number(period.from.slice(8, 10)))
        : plShort.format(asDate(period.from));
      const end = plShort.format(asDate(period.to));
      const year = asDate(period.to).getUTCFullYear();
      return `Tydzień ${start}–${end} ${year}`;
    }
    case 'month':
      return capitalize(plMonthYear.format(asDate(period.from)));
    case 'year':
      return String(asDate(period.from).getUTCFullYear());
    case 'custom': {
      const from = asDate(period.from);
      const to = asDate(period.to);
      if (period.from === period.to) return plShortYear.format(from);
      const sameYear = from.getUTCFullYear() === to.getUTCFullYear();
      const start = sameYear ? plShort.format(from) : plShortYear.format(from);
      return `${start} – ${plShortYear.format(to)}`;
    }
  }
};

/** Label of one chart bucket: `14 Paź` for a day, `Paź` for a month. */
export const pointLabel = (period: Period, index: number): string => {
  if (bucketOf(period) === 'month') {
    const date = asDate(period.from);
    date.setUTCMonth(date.getUTCMonth() + index - 1);
    return capitalize(plShortMonth.format(date));
  }
  const date = asDate(period.from);
  date.setUTCDate(date.getUTCDate() + index - 1);
  return capitalize(plShort.format(date));
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
