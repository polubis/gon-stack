import { describe, expect, it } from 'vitest';
import { periodContaining } from '@/shared/period/period';
import { periodLabel, pickerOptions } from '../domain/format';

const TODAY = '2026-10-20';

describe('period label', () => {
  it.each([
    ['day', '20.10.2026'],
    ['week', '19.10.2026 – 25.10.2026'],
    ['month', '10.2026'],
    ['year', '2026'],
  ] as const)('writes a %s with numbers only', (kind, expected) => {
    expect(periodLabel(periodContaining(kind, TODAY))).toBe(expected);
  });
});

describe('picker options', () => {
  it('stop at the present when the future is not allowed', () => {
    const [first] = pickerOptions(
      periodContaining('month', TODAY),
      TODAY,
      false,
    );

    expect(first?.label).toBe('10.2026');
  });

  it('reach into the future when it is allowed', () => {
    const [first] = pickerOptions(
      periodContaining('month', TODAY),
      TODAY,
      true,
    );

    expect(first?.label).toBe('10.2028');
  });
});
