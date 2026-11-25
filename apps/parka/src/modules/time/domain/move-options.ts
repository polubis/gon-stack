import { addDays } from '@/shared/period/period';
import { addMonths } from '@/shared/recurring/occurrences';
import { weekDays } from './schedule';

export type MoveChoice =
  | 'next-day'
  | 'previous-day'
  | 'next-week'
  | 'previous-week'
  | 'next-month'
  | 'previous-month'
  | 'custom';

export const MOVE_CHOICES: readonly MoveChoice[] = [
  'next-day',
  'previous-day',
  'next-week',
  'previous-week',
  'next-month',
  'previous-month',
  'custom',
];

/** Names of the choices, also used in the toast (`Przeniesiono „x” na następny dzień.`). */
export const MOVE_LABELS: Record<MoveChoice, string> = {
  'next-day': 'następny dzień',
  'previous-day': 'wcześniejszy dzień',
  'next-week': 'następny tydzień',
  'previous-week': 'wcześniejszy tydzień',
  'next-month': 'następny miesiąc',
  'previous-month': 'wcześniejszy miesiąc',
  custom: 'własny dzień',
};

/**
 * Day a choice leads to, counted from `from` (the task day, or today for a
 * backlog task). Weeks land on their Monday, months keep the day of month.
 * `custom` has no day of its own.
 */
export const moveTarget = (
  choice: Exclude<MoveChoice, 'custom'>,
  from: string,
): string => {
  const monday = weekDays(from)[0]!;
  switch (choice) {
    case 'next-day':
      return addDays(from, 1);
    case 'previous-day':
      return addDays(from, -1);
    case 'next-week':
      return addDays(monday, 7);
    case 'previous-week':
      return addDays(monday, -7);
    case 'next-month':
      return addMonths(from, 1);
    case 'previous-month':
      return addMonths(from, -1);
  }
};
