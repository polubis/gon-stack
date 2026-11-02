import { describe, expect, it } from 'vitest';
import { periodContaining } from '@/shared/period/period';
import { periodLabel, pickerOptions } from '../domain/format';

const TODAY = '2026-10-20';

describe('period label', () => {
  it.each([
    ['day', 'wt. 20 paź 2026'],
    ['week', 'pon. 19 – niedz. 25 paź 2026'],
    ['month', 'październik 2026'],
    ['year', '2026'],
  ] as const)('writes a %s with weekday and month names', (kind, expected) => {
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

    expect(first?.label).toBe('październik 2026');
  });

  it('reach into the future when it is allowed', () => {
    const [first] = pickerOptions(
      periodContaining('month', TODAY),
      TODAY,
      true,
    );

    expect(first?.label).toBe('październik 2028');
  });
});
