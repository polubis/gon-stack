import { fromDateTimeInput, toDateTimeInput } from '@/shared/date/date';

const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (value: number): string => plMoney.format(value);

/**
 * Local `YYYY-MM-DDTHH:mm` → UTC ISO instant; `null` when empty or invalid.
 * Keeps `original` untouched while the shown minute is not changed.
 */
export const toTimestamp = (value: string, original?: string): string | null =>
  original && toDateTimeInput(original) === value
    ? original
    : fromDateTimeInput(value);
