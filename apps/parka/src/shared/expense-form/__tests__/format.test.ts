import { describe, expect, it } from 'vitest';
import { money, toTimestamp } from '../domain/format';
import { toDateTimeInput } from '@/shared/date/date';

const normalize = (text: string) => text.replace(/\s/g, ' ');

describe('money', () => {
  it('shows two decimals with the zloty sign', () => {
    expect(normalize(money(12.5))).toBe('12,50 zł');
  });

  it('groups thousands', () => {
    expect(normalize(money(1234567.891))).toBe('1 234 567,89 zł');
  });

  it('keeps the minus for a negative amount', () => {
    expect(normalize(money(-3))).toMatch(/^-3,00 zł$/);
  });
});

describe('timestamp from the form', () => {
  it('is empty for an empty or invalid value', () => {
    expect(toTimestamp('')).toBeNull();
    expect(toTimestamp('not a date')).toBeNull();
  });

  it('converts a local value to a UTC instant', () => {
    const result = toTimestamp('2026-10-19T08:30');

    expect(result).toBe(new Date(2026, 9, 19, 8, 30).toISOString());
  });

  it('keeps the original instant while the shown minute is unchanged', () => {
    const original = '2026-10-19T06:30:15.123Z';

    expect(toTimestamp(toDateTimeInput(original), original)).toBe(original);
  });

  it('drops the original once the minute changes', () => {
    const original = '2026-10-19T06:30:15.123Z';

    expect(toTimestamp('2026-10-20T10:00', original)).toBe(
      new Date(2026, 9, 20, 10, 0).toISOString(),
    );
  });
});
