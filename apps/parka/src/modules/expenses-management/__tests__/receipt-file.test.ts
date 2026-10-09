import { describe, expect, it } from 'vitest';
import { fitWithin } from '../domain/receipt-file';

describe('receipt photo size', () => {
  it('shrinks a large photo so the longest edge fits', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
  });

  it('keeps the proportions of a tall photo', () => {
    expect(fitWithin(1000, 4000, 1600)).toEqual({ width: 400, height: 1600 });
  });

  it('does not enlarge a small photo', () => {
    expect(fitWithin(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});
