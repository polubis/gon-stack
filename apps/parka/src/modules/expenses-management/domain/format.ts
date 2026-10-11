import { localMonth } from '@/shared/date/date';
import type { Month } from './models';

const plMoney = new Intl.NumberFormat('pl-PL', {
  style: 'currency',
  currency: 'PLN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const money = (value: number): string => plMoney.format(value);

/** Instant (or plain `YYYY-MM-DD`) → the local `YYYY-MM` it falls in. */
export const monthOf = (value: string): Month => localMonth(value) as Month;
