import { describe, expect, it } from 'vitest';
import { ageLabel } from '../domain/format';

describe('notification age label', () => {
  it('says today for zero days', () => {
    expect(ageLabel(0)).toBe('dziś');
  });

  it('uses singular for one day', () => {
    expect(ageLabel(1)).toBe('1 dzień temu');
  });

  it('uses plural for more days', () => {
    expect(ageLabel(5)).toBe('5 dni temu');
  });
});
