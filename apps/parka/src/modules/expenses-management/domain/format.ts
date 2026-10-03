import type { Month } from './models';

const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (value: number): string => plMoney.format(value);

/** ISO date-time → `YYYY-MM-DD`. */
export const toDateInput = (iso: string): string => iso.slice(0, 10);

export const fromDateInput = (value: string): string =>
  `${value}T00:00:00.000Z`;

/** `YYYY-MM-DD` → `YYYY-MM`. */
export const monthOfDateInput = (value: string): Month =>
  value.slice(0, 7) as Month;
