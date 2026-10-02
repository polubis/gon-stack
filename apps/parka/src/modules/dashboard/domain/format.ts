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

const plDateTime = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const plShortMonth = new Intl.DateTimeFormat('pl-PL', { month: 'short' });

const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

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

/** `2025-04` → `Kwiecień 2025`. */
export const monthTitle = (month: Month): string =>
  capitalize(monthLabel(month));

/** `2025-04`, 14 → `14 Kwi`. */
export const dayLabel = (month: Month, day: number): string => {
  const [y, m] = toYearMonth(month);
  return `${day} ${capitalize(plShortMonth.format(new Date(y, m - 1, day)))}`;
};

/** ISO date-time → `14 Kwi 2025`. */
export const shortDateLabel = (iso: string): string => {
  const date = new Date(iso);
  return `${date.getDate()} ${capitalize(plShortMonth.format(date))} ${date.getFullYear()}`;
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
export const currentMonth = (): Month =>
  toMonth(new Date().toISOString().slice(0, 7));

export const dateTimeLabel = (iso: string): string =>
  plDateTime.format(new Date(iso));

/** ISO date-time → `YYYY-MM`. */
export const monthOf = (iso: string): Month => toMonth(iso.slice(0, 7));

export const itemTotal = (item: {
  unitPrice: number;
  quantity: number;
  discount: number;
}): number => item.unitPrice * item.quantity - item.discount;
