import { describe, expect, it } from 'vitest';
import { fitWithin, receiptFileProblem } from '../domain/receipt-file';

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

describe('receipt file check', () => {
  const file = (type: string, bytes: number) =>
    new File([new Uint8Array(bytes)], 'r', { type });

  it('accepts a small image', () => {
    expect(receiptFileProblem(file('image/png', 8))).toBeNull();
  });

  it('rejects anything but an image', () => {
    expect(receiptFileProblem(file('application/pdf', 8))).toMatch(/zdjęciem/);
  });

  it('rejects an image over 10 MB', () => {
    expect(receiptFileProblem(file('image/png', 10 * 1024 * 1024 + 1))).toMatch(
      /10 MB/,
    );
  });
});
