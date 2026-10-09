import { describe, expect, it } from 'vitest';
import { RECEIPT_MAX_BYTES, scanReceiptSchema } from '@schemas/receipts';

const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0x00];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [...'RIFF'].map((c) => c.charCodeAt(0));
const parse = (file: File) =>
  scanReceiptSchema().shape.in.safeParseAsync({ file });

const image = (bytes: number[], type = 'image/jpeg') =>
  new File([new Uint8Array(bytes)], 'receipt', { type });

describe('scan receipt contract', () => {
  it('accepts a JPEG', async () => {
    expect((await parse(image(JPEG))).success).toBe(true);
  });

  it('accepts a PNG', async () => {
    expect((await parse(image(PNG, 'image/png'))).success).toBe(true);
  });

  it('accepts a WebP', async () => {
    const bytes = [
      ...WEBP,
      0,
      0,
      0,
      0,
      ...[...'WEBP'].map((c) => c.charCodeAt(0)),
    ];

    expect((await parse(image(bytes, 'image/webp'))).success).toBe(true);
  });

  it('rejects a file that only claims to be an image', async () => {
    const file = new File(['not an image'], 'receipt.jpg', {
      type: 'image/jpeg',
    });

    expect((await parse(file)).success).toBe(false);
  });

  it('rejects an image of a type the model cannot read', async () => {
    const svg = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg"/>'],
      'a.svg',
      {
        type: 'image/svg+xml',
      },
    );

    expect((await parse(svg)).success).toBe(false);
  });

  it('rejects an empty file', async () => {
    const file = new File([], 'receipt.jpg', { type: 'image/jpeg' });

    expect((await parse(file)).success).toBe(false);
  });

  it('rejects an image over 10 MB', async () => {
    const bytes = new Uint8Array(RECEIPT_MAX_BYTES + 1);
    bytes.set(JPEG);
    const file = new File([bytes], 'big.jpg', { type: 'image/jpeg' });

    expect((await parse(file)).success).toBe(false);
  });

  it('rejects a request without a file', async () => {
    const result = await scanReceiptSchema().shape.in.safeParseAsync({});

    expect(result.success).toBe(false);
  });
});
