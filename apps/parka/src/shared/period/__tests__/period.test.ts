import { describe, expect, it } from 'vitest';
import {
  canGoNext,
  limitForPeriod,
  clampPeriod,
  currentPeriod,
  fromInputValue,
  maxInputValue,
  toInputValue,
  periodContaining,
  periodMonths,
  shiftPeriod,
} from '../period';

const TODAY = '2026-10-10';

describe('period', () => {
  it('starts a week on Monday and ends it on Sunday', () => {
    expect(periodContaining('week', '2026-10-10')).toEqual({
      kind: 'week',
      from: '2026-10-05',
      to: '2026-10-11',
    });
    expect(periodContaining('week', '2026-10-11').from).toBe('2026-10-05');
    expect(periodContaining('week', '2026-10-12').from).toBe('2026-10-12');
  });

  it('spans a whole month, also a short one', () => {
    expect(periodContaining('month', '2028-02-10')).toEqual({
      kind: 'month',
      from: '2028-02-01',
      to: '2028-02-29',
    });
  });

  it('spans a whole year', () => {
    expect(periodContaining('year', TODAY)).toEqual({
      kind: 'year',
      from: '2026-01-01',
      to: '2026-12-31',
    });
  });

  it('steps back and forth across month and year edges', () => {
    const january = periodContaining('month', '2026-01-15');

    expect(shiftPeriod(january, -1).from).toBe('2025-12-01');
    expect(shiftPeriod(shiftPeriod(january, -1), 1)).toEqual(january);
    expect(shiftPeriod(periodContaining('day', '2026-03-01'), -1).from).toBe(
      '2026-02-28',
    );
    expect(shiftPeriod(periodContaining('week', TODAY), -1).from).toBe(
      '2026-09-28',
    );
    expect(shiftPeriod(periodContaining('year', TODAY), -1).from).toBe(
      '2025-01-01',
    );
  });

  it('allows next only while the period ended before today', () => {
    expect(canGoNext(currentPeriod('day', TODAY), TODAY)).toBe(false);
    expect(canGoNext(currentPeriod('week', TODAY), TODAY)).toBe(false);
    expect(canGoNext(currentPeriod('month', TODAY), TODAY)).toBe(false);
    expect(canGoNext(currentPeriod('year', TODAY), TODAY)).toBe(false);
    expect(canGoNext(periodContaining('month', '2026-09-30'), TODAY)).toBe(
      true,
    );
    expect(canGoNext(periodContaining('week', '2026-10-04'), TODAY)).toBe(true);
  });

  it('snaps a future period to the present one', () => {
    expect(clampPeriod(periodContaining('month', '2027-01-01'), TODAY)).toEqual(
      currentPeriod('month', TODAY),
    );
    const past = periodContaining('month', '2026-02-01');
    expect(clampPeriod(past, TODAY)).toBe(past);
  });

  it('lists the months a period touches', () => {
    expect(periodMonths(periodContaining('week', '2026-09-30'))).toEqual([
      '2026-09',
      '2026-10',
    ]);
    expect(periodMonths(periodContaining('year', TODAY))).toHaveLength(12);
  });
});

describe('period input values', () => {
  it('round-trips every kind', () => {
    for (const kind of ['day', 'week', 'month', 'year'] as const) {
      const period = periodContaining(kind, '2026-10-10');
      expect(fromInputValue(kind, toInputValue(period))).toEqual(period);
    }
  });

  it('numbers ISO weeks across the year edge', () => {
    expect(toInputValue(periodContaining('week', '2026-10-10'))).toBe(
      '2026-W41',
    );
    expect(toInputValue(periodContaining('week', '2027-01-01'))).toBe(
      '2026-W53',
    );
    expect(fromInputValue('week', '2026-W53')?.from).toBe('2026-12-28');
  });

  it('rejects empty and malformed values', () => {
    expect(fromInputValue('day', '')).toBeNull();
    expect(fromInputValue('month', '2026-13')).toBeNull();
    expect(fromInputValue('week', 'x')).toBeNull();
  });

  it('caps input at the present period', () => {
    expect(maxInputValue('day', TODAY)).toBe('2026-10-10');
    expect(maxInputValue('week', TODAY)).toBe('2026-W41');
    expect(maxInputValue('month', TODAY)).toBe('2026-10');
    expect(maxInputValue('year', TODAY)).toBe('2026');
  });
});

describe('limit scaled to a period', () => {
  it('keeps the monthly limit for a month', () => {
    expect(limitForPeriod(3100, periodContaining('month', '2026-10-10'))).toBe(
      3100,
    );
    expect(limitForPeriod(2800, periodContaining('month', '2026-02-10'))).toBe(
      2800,
    );
  });

  it('gives a day its share of the month', () => {
    expect(limitForPeriod(3100, periodContaining('day', '2026-10-10'))).toBe(
      100,
    );
    expect(limitForPeriod(2800, periodContaining('day', '2026-02-10'))).toBe(
      100,
    );
  });

  it('sums the shares of both months for a week across the edge', () => {
    // 2026-09-28..30 in a 30-day month, 2026-10-01..04 in a 31-day month.
    expect(limitForPeriod(3000, periodContaining('week', '2026-09-30'))).toBe(
      687.1,
    );
    expect(limitForPeriod(3100, periodContaining('week', '2026-10-07'))).toBe(
      700,
    );
  });

  it('gives a year twelve months', () => {
    expect(limitForPeriod(500, periodContaining('year', '2026-06-01'))).toBe(
      6000,
    );
  });
});
