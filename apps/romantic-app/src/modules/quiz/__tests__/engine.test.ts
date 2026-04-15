import { describe, expect, it } from 'vitest';
import { resolveRoundDelta } from '../core/engine';

describe('quiz engine base scoring', () => {
  it('returns +1 when answers match', () => {
    expect(resolveRoundDelta('Yes', 'yes')).toBe(1);
  });

  it('returns -1 when answers mismatch', () => {
    expect(resolveRoundDelta('yes', 'no')).toBe(-1);
  });

  it('returns 0 when one side has no answer', () => {
    expect(resolveRoundDelta('yes', null)).toBe(0);
  });
});
