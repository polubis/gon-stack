import {
  dayLabel,
  monthLabel,
  monthNameLabel,
  rangeLabel,
} from '@/shared/date/date';
import { resolvePeriod } from '@/shared/period/period';
import type { TimeKind } from './models';

/**
 * Polish heading of the viewed period, e.g. `wtorek, 20 października 2026`,
 * `poniedziałek, 19 – niedziela, 25 października 2026`, `październik 2026`,
 * `2026`.
 */
export const periodTitle = (
  kind: TimeKind,
  anchor: string,
  last?: string,
): string => {
  const { from, to } = resolvePeriod(kind, anchor, last);
  switch (kind) {
    case 'day':
      return dayLabel(from, 'long');
    case 'week':
    case 'custom':
      return rangeLabel(from, to, 'long');
    case 'month':
      return monthLabel(from.slice(0, 7));
    case 'year':
      return from.slice(0, 4);
  }
};

/** `wtorek, 20 października`: a day with weekday and month, no year. */
export const fullDate = (day: string): string => dayLabel(day, 'long', false);

/** Capitalised month name; `monthIndex` is zero-based. */
export const monthName = (monthIndex: number): string => {
  const name = monthNameLabel(monthIndex);
  return name.charAt(0).toUpperCase() + name.slice(1);
};
