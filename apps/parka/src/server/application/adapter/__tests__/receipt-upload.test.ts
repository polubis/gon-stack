// @vitest-environment node
import type { APIContext } from 'astro';
import { describe, expect, it } from 'vitest';
import { scanReceiptSchema } from '@schemas/receipts';
import { astroAdapter } from '../astro';

const send = async (file: File) => {
  const body = new FormData();
  body.append('file', file);
  let input: unknown;
  const route = astroAdapter(async (readInput) => {
    input = await readInput();
    return { code: 200 };
  });
  await route({
    request: new Request('http://localhost/api/receipts/scan/', {
      method: 'POST',
      body,
    }),
    params: {},
  } as unknown as APIContext);
  return scanReceiptSchema().shape.in.safeParseAsync(input);
};

describe('receipt upload over multipart', () => {
  it('reaches the contract as a valid image file', async () => {
    const result = await send(
      new File([new Uint8Array([0xff, 0xd8, 0xff])], 'receipt.jpg', {
        type: 'image/jpeg',
      }),
    );

    expect(result.success).toBe(true);
  });

  it('is refused when the file is not an image', async () => {
    const result = await send(
      new File(['x'], 'notes.txt', { type: 'text/plain' }),
    );

    expect(result.success).toBe(false);
  });
});
