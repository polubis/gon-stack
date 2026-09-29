import type { Month } from './models';

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plMonth = new Intl.DateTimeFormat('pl-PL', {
  month: 'long',
  year: 'numeric',
});

const plDate = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

/** Validates `YYYY-MM` and brands it; throws on any other shape. */
export const toMonth = (value: string): Month => {
  if (!MONTH_PATTERN.test(value)) {
    throw new Error(`Invalid month: "${value}".`);
  }
  return value as Month;
};

export const money = (value: number): string => plMoney.format(value);

export const dateLabel = (iso: string): string => plDate.format(new Date(iso));

/** `2025-04` → `kwiecień 2025`. */
export const monthLabel = (month: Month): string => {
  const [y, m] = month.split('-').map(Number);
  return plMonth.format(new Date(y, m - 1, 1));
};

/** ISO date-time → its `YYYY-MM`. */
export const monthOf = (iso: string): Month => toMonth(iso.slice(0, 7));

/** Today's month, e.g. `2026-09`. */
export const currentMonth = (): Month => monthOf(new Date().toISOString());
