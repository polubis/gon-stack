import { describe, expect, it } from 'vitest';
import {
  dateTimeLabel,
  dayHeading,
  plainDateLabel,
  prevMonth,
  spentMoney,
  toMonth,
} from '../domain/format';

describe('dashboard formatting', () => {
  it('labels a plain day with weekday, short month and year', () => {
    expect(plainDateLabel('2025-04-14')).toBe('pon. 14 kwi 2025');
  });

  it('labels a date with weekday and the local time', () => {
    expect(dateTimeLabel('2025-04-14T12:05:00')).toBe(
      'pon. 14 kwi 2025, 12:05',
    );
  });

  it('steps back over a year boundary', () => {
    expect(prevMonth(toMonth('2025-01'))).toBe('2024-12');
  });
});

describe('dashboard day headings', () => {
  const TODAY = '2025-04-14';

  it('calls the current day "Dzisiaj"', () => {
    expect(dayHeading('2025-04-14', TODAY)).toBe('Dzisiaj');
  });

  it('calls the previous day "Wczoraj" across a month boundary', () => {
    expect(dayHeading('2025-03-31', '2025-04-01')).toBe('Wczoraj');
  });

  it('labels older days by weekday and date, year only when it differs', () => {
    expect(dayHeading('2025-04-10', TODAY)).toBe('czw. 10 kwi');
    expect(dayHeading('2024-12-30', TODAY)).toBe('pon. 30 gru 2024');
  });

  it('shows an expense as an outflow', () => {
    expect(spentMoney(62.1)).toMatch(/^-62,10\s?zł$/);
  });
});
