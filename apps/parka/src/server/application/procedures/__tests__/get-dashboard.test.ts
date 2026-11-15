// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { code: string } | null };

const ME = 'u-1';

/** Result per table; every table read is recorded in `reads`. */
let results: Record<string, Result> = {};
let reads: { table: string; columns: string }[] = [];

const ok = (data: unknown): Result => ({ data, error: null });

const query = (table: string) => {
  const done = () => Promise.resolve(results[table] ?? ok(null));
  const chain: Record<string, unknown> = {
    select: (columns: string) => {
      reads.push({ table, columns });
      return chain;
    },
    eq: () => chain,
    gte: () => chain,
    lt: () => chain,
    maybeSingle: done,
    then: (resolve: (value: Result) => unknown) => done().then(resolve),
  };
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
  }),
}));

vi.mock('../../shared/recurring', () => ({
  materializeRecurring: async () => undefined,
}));

const { getDashboard } = await import('../get-dashboard');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const item = (categoryId: string, unitPrice: number) => ({
  category_id: categoryId,
  unit_price: unitPrice,
  quantity: 1,
  discount: 0,
});

const load = async () =>
  (await getDashboard(
    async () => ({ kind: 'custom', from: '2020-01-01', to: '2020-01-31' }),
    context,
  )) as {
    code: number;
    data: {
      total: number;
      transactions: number;
      userName: string;
      categories: { categoryId: string; amount: number }[];
    };
  };

beforeEach(() => {
  reads = [];
  results = {
    categories: ok([
      { id: 'food', name: 'Food', color: '#111111' },
      { id: 'home', name: 'Home', color: '#222222' },
    ]),
    limits: ok([]),
    profiles: ok({ name: 'Anna' }),
  };
});

describe('get dashboard', () => {
  it('splits an expense with products by their own categories', async () => {
    results.expenses = ok([
      {
        date: '2020-01-10T12:00:00.000Z',
        amount: 30,
        category_id: null,
        receipt_items: [item('food', 10), item('home', 20)],
      },
    ]);

    const response = await load();

    expect(response.code).toBe(200);
    expect(response.data.total).toBe(30);
    expect(response.data.transactions).toBe(1);
    expect(response.data.userName).toBe('Anna');
    expect(
      Object.fromEntries(
        response.data.categories.map((c) => [c.categoryId, c.amount]),
      ),
    ).toEqual({ food: 10, home: 20 });
  });

  it('counts an expense without products under its own category', async () => {
    results.expenses = ok([
      {
        date: '2020-01-12T12:00:00.000Z',
        amount: 15,
        category_id: 'food',
        receipt_items: [],
      },
    ]);

    const response = await load();

    expect(response.data.total).toBe(15);
    expect(response.data.categories).toMatchObject([
      { categoryId: 'food', amount: 15 },
    ]);
  });

  it('reads products only together with the expenses of the period', async () => {
    results.expenses = ok([]);

    await load();

    expect(reads.map((r) => r.table)).not.toContain('receipt_items');
    expect(reads.find((r) => r.table === 'expenses')?.columns).toContain(
      'receipt_items(',
    );
  });

  it('answers with zero for a period without expenses', async () => {
    results.expenses = ok([]);

    const response = await load();

    expect(response.data).toMatchObject({ total: 0, transactions: 0 });
  });
});
