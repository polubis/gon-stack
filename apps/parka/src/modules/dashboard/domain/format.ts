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

/** `2025-04` → `kwiecień 2025`. */
export const monthLabel = (month: Month): string => {
  const [y, m] = toYearMonth(month);
  return plMonth.format(new Date(y, m - 1, 1));
};

/** `2025-04` → `2025-03`. */
export const prevMonth = (month: Month): Month => {
  const [y, m] = toYearMonth(month);
  const d = new Date(y, m - 2, 1);
  return toMonth(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
  );
};

/** `2025-04` → `2025-05`. */
export const nextMonth = (month: Month): Month => {
  const [y, m] = toYearMonth(month);
  const d = new Date(y, m, 1);
  return toMonth(
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
  );
};

/** Today's month, e.g. `2026-09`. */
export const currentMonth = (): Month =>
  toMonth(new Date().toISOString().slice(0, 7));
