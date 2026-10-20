import { periodContaining } from '@/shared/period/period';
import type { TimeKind } from './models';

const format = (options: Intl.DateTimeFormatOptions, day: string): string =>
  new Intl.DateTimeFormat('pl', { timeZone: 'UTC', ...options }).format(
    new Date(`${day}T00:00:00Z`),
  );

/**
 * Polish heading of the viewed period, e.g. `wtorek, 20 października 2026`,
 * `19 – 25 października 2026`, `październik 2026`, `2026`.
 */
export const periodTitle = (kind: TimeKind, anchor: string): string => {
  const { from, to } = periodContaining(kind, anchor);
  switch (kind) {
    case 'day':
      return format(
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        from,
      );
    case 'week': {
      const sameMonth = from.slice(0, 7) === to.slice(0, 7);
      const sameYear = from.slice(0, 4) === to.slice(0, 4);
      const start = format(
        sameMonth
          ? { day: 'numeric' }
          : sameYear
            ? { day: 'numeric', month: 'long' }
            : { day: 'numeric', month: 'long', year: 'numeric' },
        from,
      );
      const end = format(
        { day: 'numeric', month: 'long', year: 'numeric' },
        to,
      );
      return `${start} – ${end}`;
    }
    case 'month':
      return format({ month: 'long', year: 'numeric' }, from);
    case 'year':
      return format({ year: 'numeric' }, from);
  }
};

export const weekdayShort = (day: string): string =>
  format({ weekday: 'short' }, day).replace('.', '');

export const weekdayLong = (day: string): string =>
  format({ weekday: 'long' }, day);

export const fullDate = (day: string): string =>
  format({ weekday: 'long', day: 'numeric', month: 'long' }, day);

/** Capitalised month name; `monthIndex` is zero-based. */
export const monthName = (monthIndex: number): string => {
  const name = format(
    { month: 'long' },
    `2026-${String(monthIndex + 1).padStart(2, '0')}-01`,
  );
  return name.charAt(0).toUpperCase() + name.slice(1);
};
