import { describe, expect, it } from 'vitest';
import {
  currentMonth,
  dateLabel,
  money,
  monthLabel,
  monthOf,
  toMonth,
} from '../domain/format';

const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('reports format', () => {
  it('accepts a well formed month', () => {
    expect(toMonth('2025-04')).toBe('2025-04');
  });

  it.each(['2025-4', '25-04', '2025-04-01', 'april', ''])(
    'rejects "%s" as a month',
    (value) => {
      expect(() => toMonth(value)).toThrow(`Invalid month: "${value}".`);
    },
  );

  it('shows money in zloty with two decimals', () => {
    expect(normalize(money(12345.5))).toBe('12 345,50 zł');
  });

  it('shows zero and negative money', () => {
    expect(normalize(money(0))).toBe('0,00 zł');
    expect(normalize(money(-10))).toContain('10,00 zł');
  });

  it('names a month in Polish', () => {
    expect(monthLabel(toMonth('2025-04'))).toBe('kwiecień 2025');
  });

  it('names the last month of a year', () => {
    expect(monthLabel(toMonth('2025-12'))).toBe('grudzień 2025');
  });

  it('shows a date as day.month.year', () => {
    expect(dateLabel('2025-04-09T12:00:00.000Z')).toBe('09.04.2025');
  });

  it('finds the month of an instant at midday', () => {
    expect(monthOf('2025-04-15T12:00:00.000Z')).toBe('2025-04');
  });

  it('tells today as a valid month', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/);
  });
});
