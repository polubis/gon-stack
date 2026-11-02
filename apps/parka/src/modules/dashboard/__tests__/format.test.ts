import { describe, expect, it } from 'vitest';
import {
  dateTimeLabel,
  plainDateLabel,
  prevMonth,
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
