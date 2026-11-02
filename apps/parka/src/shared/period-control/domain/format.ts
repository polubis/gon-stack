import { dayLabel, monthLabel, rangeLabel } from '@/shared/date/date';
import {
  currentPeriod,
  shiftPeriod,
  toInputValue,
  type Period,
  type PeriodKind,
} from '@/shared/period/period';

export const PERIOD_KIND_LABELS: Record<PeriodKind, string> = {
  day: 'Dzień',
  week: 'Tydzień',
  month: 'Miesiąc',
  year: 'Rok',
  custom: 'Własny',
};

/**
 * Heading of a period with weekday and month names: `wt. 20 paź 2026`,
 * `pon. 19 – niedz. 25 paź 2026`, `październik 2026`, `2026`. Same shape in
 * every module that uses the control.
 */
export const periodLabel = (period: Period): string => {
  switch (period.kind) {
    case 'day':
      return dayLabel(period.from);
    case 'week':
    case 'custom':
      return rangeLabel(period.from, period.to);
    case 'month':
      return monthLabel(period.from.slice(0, 7));
    case 'year':
      return period.from.slice(0, 4);
  }
};

/** How far back / ahead the pickers reach, per kind chosen from a list. */
const BACK = { week: 53, month: 60, year: 10 } as const;
const AHEAD = { week: 26, month: 24, year: 5 } as const;

export type PickerOption = { value: string; label: string };

/**
 * Choices of a list picker, newest first. Later than the present only when
 * `allowFuture`.
 */
export const pickerOptions = (
  period: Period,
  today: string,
  allowFuture: boolean,
): PickerOption[] => {
  if (period.kind === 'day' || period.kind === 'custom') return [];
  const ahead = allowFuture ? AHEAD[period.kind] : 0;
  const present = currentPeriod(period.kind, today);
  const periods = Array.from({ length: ahead + BACK[period.kind] }, (_, i) =>
    shiftPeriod(present, ahead - i),
  );
  if (!periods.some((p) => p.from === period.from)) periods.push(period);
  return periods.map((p) => ({
    value: toInputValue(p),
    label: periodLabel(p),
  }));
};
