// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const rpc = vi.fn();
const readReceipt = vi.fn();
const signedIn = {
  data: { user: { id: 'u1', email: 'a@b.c', user_metadata: {} } },
  error: null,
};
const getUser = vi.fn();

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: { getUser },
    rpc,
    from: () => ({ select: async () => ({ data: [], error: null }) }),
  }),
}));

vi.mock('../../../shared/receipt-reader', () => ({ readReceipt }));

const { scanReceipt } = await import('..');

const jpeg = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff])], 'receipt.jpg', {
    type: 'image/jpeg',
  });

const scan = (readInput: () => Promise<unknown>) =>
  scanReceipt(readInput, {
    request: new Request('http://localhost/api/receipts/scan/'),
    cookies: {},
  } as unknown as APIContext);

const unreadBody = async (): Promise<unknown> => {
  throw new Error('request body was read');
};

describe('scan receipt quota', () => {
  beforeEach(() => {
    rpc.mockReset();
    readReceipt.mockReset();
    getUser.mockReset().mockResolvedValue(signedIn);
  });

  it('refuses with 401 when signed out', async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await scan(unreadBody);

    expect(response).toMatchObject({ code: 401 });
  });

  it('refuses with 400 for a file that only claims to be an image', async () => {
    const response = await scan(async () => ({
      file: new File(['not an image'], 'receipt.jpg', { type: 'image/jpeg' }),
    }));

    expect(response).toMatchObject({ code: 400 });
  });

  it('refuses with 429 when the daily limit is used', async () => {
    rpc.mockResolvedValue({ data: false, error: null });

    const response = await scan(async () => ({ file: jpeg() }));

    expect(response).toMatchObject({ code: 429, type: 'too-many-requests' });
  });

  it('returns a draft while under the daily limit', async () => {
    rpc.mockResolvedValue({ data: true, error: null });
    readReceipt.mockResolvedValue({
      merchant: 'Biedronka',
      date: '2026-10-07T10:00:00.000Z',
      amount: 5.5,
      paymentMethod: 'Card',
      items: [
        {
          name: 'Bread',
          unitPrice: 5.5,
          quantity: 1,
          discount: 0,
          category: null,
          suggestedCategory: null,
        },
      ],
    });

    const response = await scan(async () => ({ file: jpeg() }));

    expect(response).toMatchObject({
      code: 200,
      data: { merchant: 'Biedronka', amount: 5.5 },
    });
  });

  it('fails when the quota check itself fails', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'db down' } });

    const response = await scan(async () => ({ file: jpeg() }));

    expect(response).toMatchObject({ code: 500 });
  });
});
