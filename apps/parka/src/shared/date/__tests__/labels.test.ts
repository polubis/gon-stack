import { describe, expect, it } from 'vitest';
import {
  dayLabel,
  monthLabel,
  monthNameLabel,
  rangeLabel,
  weekdayLabel,
} from '../date';

describe('day label', () => {
  it('names the weekday and the month in short form', () => {
    expect(dayLabel('2026-10-19')).toBe('pon. 19 paź 2026');
  });

  it('spells everything out in long form', () => {
    expect(dayLabel('2026-10-19', 'long')).toBe(
      'poniedziałek, 19 października 2026',
    );
  });

  it('can leave the year out', () => {
    expect(dayLabel('2026-10-19', 'long', false)).toBe(
      'poniedziałek, 19 października',
    );
  });
});

describe('weekday and month names', () => {
  it('names a weekday', () => {
    expect(weekdayLabel('2026-10-25')).toBe('niedz.');
    expect(weekdayLabel('2026-10-25', 'long')).toBe('niedziela');
  });

  it('names a month with its year', () => {
    expect(monthLabel('2026-10')).toBe('październik 2026');
    expect(monthLabel('2026-10', 'short')).toBe('paź 2026');
  });

  it('names a month by its index', () => {
    expect(monthNameLabel(0)).toBe('styczeń');
    expect(monthNameLabel(9, 'short')).toBe('paź');
  });
});

describe('range label', () => {
  it('writes the shared month and year once', () => {
    expect(rangeLabel('2026-10-19', '2026-10-25')).toBe(
      'pon. 19 – niedz. 25 paź 2026',
    );
  });

  it('keeps both months when the range crosses a month', () => {
    expect(rangeLabel('2026-09-28', '2026-10-04')).toBe(
      'pon. 28 wrz – niedz. 4 paź 2026',
    );
  });

  it('keeps both years when the range crosses a year', () => {
    expect(rangeLabel('2025-12-29', '2026-01-04')).toBe(
      'pon. 29 gru 2025 – niedz. 4 sty 2026',
    );
  });

  it('collapses one day to a day label', () => {
    expect(rangeLabel('2026-10-19', '2026-10-19')).toBe('pon. 19 paź 2026');
  });

  it('spells a range out in long form', () => {
    expect(rangeLabel('2026-10-19', '2026-10-25', 'long')).toBe(
      'poniedziałek, 19 – niedziela, 25 października 2026',
    );
  });
});
