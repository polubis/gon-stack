import { describe, expect, it } from 'vitest';
import { RECEIPT_MAX_BYTES, scanReceiptSchema } from '@schemas/receipts';

const parse = (file: File) => scanReceiptSchema().shape.in.safeParse({ file });

describe('scan receipt contract', () => {
  it('accepts an image', () => {
    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' });

    expect(parse(file).success).toBe(true);
  });

  it('rejects a file that is not an image', () => {
    const file = new File(['x'], 'receipt.pdf', { type: 'application/pdf' });

    expect(parse(file).success).toBe(false);
  });

  it('rejects an empty file', () => {
    const file = new File([], 'receipt.jpg', { type: 'image/jpeg' });

    expect(parse(file).success).toBe(false);
  });

  it('rejects an image over 10 MB', () => {
    const file = new File([new Uint8Array(RECEIPT_MAX_BYTES + 1)], 'big.jpg', {
      type: 'image/jpeg',
    });

    expect(parse(file).success).toBe(false);
  });

  it('rejects a request without a file', () => {
    expect(scanReceiptSchema().shape.in.safeParse({}).success).toBe(false);
  });
});
