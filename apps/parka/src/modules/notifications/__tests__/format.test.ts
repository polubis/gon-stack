import { describe, expect, it } from 'vitest';
import { ageLabel } from '../domain/format';

const NOW = Date.parse('2026-10-12T12:00:00.000Z');
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('notification age label', () => {
  it('says just now for a fresh notification', () => {
    expect(ageLabel(ago(10_000), NOW)).toBe('przed chwilą');
  });

  it('counts minutes', () => {
    expect(ageLabel(ago(5 * MINUTE), NOW)).toBe('5 min temu');
  });

  it('counts hours', () => {
    expect(ageLabel(ago(3 * HOUR), NOW)).toBe('3 godz. temu');
  });

  it('uses singular for one day', () => {
    expect(ageLabel(ago(DAY), NOW)).toBe('1 dzień temu');
  });

  it('uses plural for more days', () => {
    expect(ageLabel(ago(5 * DAY), NOW)).toBe('5 dni temu');
  });
});
