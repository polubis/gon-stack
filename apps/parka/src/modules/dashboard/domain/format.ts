import { dayLabel, instantDateTimeLabel, localMonth } from '@/shared/date/date';
import type { Month } from './models';

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const toYearMonth = (month: Month): [number, number] =>
  month.split('-').map(Number) as [number, number];

export const money = (value: number): string => plMoney.format(value);

export const percent = (value: number): string =>
  `${value > 0 ? '+' : ''}${Math.round(value)}%`;

/** Validates `YYYY-MM` and brands it; throws on any other shape. */
export const toMonth = (value: string): Month => {
  if (!MONTH_PATTERN.test(value)) {
    throw new Error(`Invalid month: "${value}".`);
  }
  return value as Month;
};

/** `2025-04` → `2025-03`. */
export const prevMonth = (month: Month): Month => {
  const [y, m] = toYearMonth(month);
  const d = new Date(y, m - 2, 1);
  return toMonth(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
  );
};

/** Today's month, e.g. `2026-09`. */
export const currentMonth = (): Month => toMonth(localMonth(new Date()));

/** ISO date-time → `pon. 14 kwi 2025, 14:30` in the user's time zone. */
export const dateTimeLabel = (iso: string): string => instantDateTimeLabel(iso);

/** Plain day `YYYY-MM-DD` → `pon. 14 kwi 2025`; never shifted by the time zone. */
export const plainDateLabel = (day: string): string => dayLabel(day);

/** ISO date-time → `YYYY-MM`. */
export const monthOf = (iso: string): Month => toMonth(localMonth(iso));

export const itemTotal = (item: {
  unitPrice: number;
  quantity: number;
  discount: number;
}): number => item.unitPrice * item.quantity - item.discount;
