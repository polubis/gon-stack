// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: null };

const ME = 'u-1';
const LATENCY_MS = 25;

const EXPENSE = {
  id: 'e-1',
  user_id: ME,
  merchant: 'Biedronka',
  date: '2020-01-10',
  amount: 30,
  category_id: 'food',
  payment_method: 'card',
  is_bill: false,
  source: 'manual',
  recurring_id: null,
  occurrence_date: null,
  device_id: null,
  device_name: null,
  device_type: null,
};

/** Rows per table; every call costs fixed latency, like a network round trip. */
let rows: Record<string, unknown> = {};
let calls: string[] = [];

const later = (data: unknown) =>
  new Promise<Result>((resolve) =>
    setTimeout(() => resolve({ data, error: null }), LATENCY_MS),
  );

const query = (table: string) => {
  calls.push(table);
  const done = () => later(rows[table] ?? []);
  const chain: Record<string, unknown> = {};
  for (const name of [
    'select',
    'insert',
    'update',
    'upsert',
    'delete',
    'eq',
    'in',
    'gte',
    'lt',
    'order',
  ]) {
    chain[name] = () => chain;
  }
  chain.single = done;
  chain.maybeSingle = done;
  chain.then = (resolve: (value: Result) => unknown) => done().then(resolve);
  return chain;
};

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: ME, email: 'anna@parka.test', user_metadata: {} } },
        error: null,
      }),
    },
    from: query,
    storage: {
      from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }),
    },
  }),
}));

const { createExpense } = await import('../create-expense');
const { updateExpense } = await import('../update-expense');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const body = {
  id: 'e-1',
  merchant: 'Biedronka',
  date: '2020-01-10',
  amount: 30,
  categoryId: 'food',
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [
    {
      id: 'i-1',
      name: 'Milk',
      unitPrice: 10,
      quantity: 3,
      discount: 0,
      categoryId: 'food',
    },
  ],
  device: null,
};

const timed = async <T>(run: () => Promise<T>) => {
  const start = performance.now();
  const response = await run();
  return { response, ms: performance.now() - start };
};

beforeEach(() => {
  calls = [];
  rows = {
    expenses: EXPENSE,
    categories: [{ id: 'food', name: 'Food' }],
    device_profiles: [],
    limits: [],
  };
});

describe('expense writes', () => {
  it('creates an expense and returns it', async () => {
    const { response, ms } = await timed(() =>
      createExpense(async () => body, context),
    );

    console.info(`create-expense: ${Math.round(ms)} ms, ${calls.length} calls`);
    expect(response).toMatchObject({
      code: 201,
      data: {
        id: 'e-1',
        merchant: 'Biedronka',
        amount: 30,
        categoryId: 'food',
        items: body.items,
      },
    });
    expect(ms).toBeLessThan(LATENCY_MS * 6);
  });

  it('updates an expense and returns it', async () => {
    const { response, ms } = await timed(() =>
      updateExpense(async () => body, context),
    );

    console.info(`update-expense: ${Math.round(ms)} ms, ${calls.length} calls`);
    expect(response).toMatchObject({
      code: 200,
      data: {
        id: 'e-1',
        merchant: 'Biedronka',
        amount: 30,
        categoryId: 'food',
        items: body.items,
      },
    });
    expect(ms).toBeLessThan(LATENCY_MS * 8);
  });
});
