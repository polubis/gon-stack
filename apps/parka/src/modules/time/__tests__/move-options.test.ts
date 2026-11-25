import { describe, expect, it } from 'vitest';
import { moveTarget } from '../domain/move-options';

describe('move targets', () => {
  it('steps a day back and forth', () => {
    expect(moveTarget('next-day', '2026-10-20')).toBe('2026-10-21');
    expect(moveTarget('previous-day', '2026-10-20')).toBe('2026-10-19');
  });

  it('lands on the Monday of the neighbour week', () => {
    expect(moveTarget('next-week', '2026-10-20')).toBe('2026-10-26');
    expect(moveTarget('previous-week', '2026-10-20')).toBe('2026-10-12');
  });

  it('keeps the day of month and clamps it in a short month', () => {
    expect(moveTarget('next-month', '2026-10-20')).toBe('2026-11-20');
    expect(moveTarget('next-month', '2026-01-31')).toBe('2026-02-28');
    expect(moveTarget('previous-month', '2026-03-31')).toBe('2026-02-28');
  });
});
