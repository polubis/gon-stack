// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const parse = vi.fn();

vi.mock('openai', () => ({
  default: class {
    responses = { parse };
  },
}));

vi.stubEnv('PARKA_AI_API_KEY', 'test-key');
vi.stubEnv('PARKA_AI_BASE_URL', 'https://example.test/v1');
vi.stubEnv('PARKA_AI_MODEL', 'test-model');

const { readReceipt } = await import('../receipt-reader');

const item = (overrides: object = {}) => ({
  name: 'Bread',
  unitPrice: 5.5,
  quantity: 1,
  discount: 0,
  category: null,
  suggestedCategory: null,
  ...overrides,
});

const receipt = (overrides: object = {}) => ({
  merchant: 'Biedronka',
  date: '2026-10-07T10:00:00.000Z',
  amount: 5.5,
  paymentMethod: 'Card',
  items: [item()],
  ...overrides,
});

const read = async (output: unknown) => {
  parse.mockResolvedValue({ output_parsed: output });

  return readReceipt({
    file: new File([new Uint8Array([0xff, 0xd8, 0xff])], 'receipt.jpg', {
      type: 'image/jpeg',
    }),
    categoryNames: ['Food'],
    signal: new AbortController().signal,
  });
};

describe('receipt reader output checks', () => {
  beforeEach(() => parse.mockReset());

  it('returns a well formed receipt', async () => {
    const result = await read(receipt());

    expect(result.merchant).toBe('Biedronka');
    expect(result.items).toHaveLength(1);
  });

  it('strips control and invisible characters from text', async () => {
    const result = await read(
      receipt({
        merchant: '  Bie‮dronka\u0000  ',
        items: [item({ name: 'Br​ead', suggestedCategory: 'Pe\nts' })],
      }),
    );

    expect(result.merchant).toBe('Bie dronka');
    expect(result.items[0]?.name).toBe('Br ead');
    expect(result.items[0]?.suggestedCategory).toBe('Pe ts');
  });

  it.each([
    ['an overlong merchant', receipt({ merchant: 'x'.repeat(101) })],
    [
      'an overlong suggested category',
      receipt({ items: [item({ suggestedCategory: 'x'.repeat(51) })] }),
    ],
    [
      'too many items',
      receipt({ items: Array.from({ length: 101 }, () => item()) }),
    ],
    ['no items', receipt({ items: [] })],
    ['a huge price', receipt({ items: [item({ unitPrice: 1e9 })] })],
    ['a negative price', receipt({ items: [item({ unitPrice: -1 })] })],
    [
      'a discount above the line total',
      receipt({ items: [item({ discount: 50 })] }),
    ],
    ['a missing merchant', receipt({ merchant: null })],
  ])('rejects %s', async (_name, output) => {
    await expect(read(output)).rejects.toMatchObject({ code: 500 });
  });

  it('keeps a missing payment method as null', async () => {
    const result = await read(receipt({ paymentMethod: null }));

    expect(result.paymentMethod).toBeNull();
  });

  it.each([
    ['missing', null],
    ['malformed', 'yesterday-ish'],
    ['in the future', '2999-01-01T00:00:00.000Z'],
    ['before 2000', '1990-01-01T00:00:00.000Z'],
  ])('uses today when the date is %s', async (_name, date) => {
    const before = Date.now();
    const result = await read(receipt({ date }));

    expect(Date.parse(result.date)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.date)).toBeLessThanOrEqual(Date.now());
  });

  it('keeps a valid date', async () => {
    const result = await read(receipt());

    expect(result.date).toBe('2026-10-07T10:00:00.000Z');
  });
});
