import { describe, expect, it } from 'vitest';
import {
  dayLabel,
  monthTitle,
  prevMonth,
  shortDateLabel,
  shortDateTimeLabel,
  toMonth,
} from '../domain/format';

describe('dashboard formatting', () => {
  it('titles a month with a capital letter', () => {
    expect(monthTitle(toMonth('2025-04'))).toBe('Kwiecień 2025');
  });

  it('labels a day with a short capitalised month', () => {
    expect(dayLabel(toMonth('2025-04'), 14)).toBe('14 Kwi');
  });

  it('labels a date with day, short month and year', () => {
    expect(shortDateLabel('2025-04-14T12:00:00')).toBe('14 Kwi 2025');
  });

  it('labels a date with the local time', () => {
    expect(shortDateTimeLabel('2025-04-14T12:05:00')).toBe(
      '14 Kwi 2025, 12:05',
    );
  });

  it('steps back over a year boundary', () => {
    expect(prevMonth(toMonth('2025-01'))).toBe('2024-12');
  });
});
