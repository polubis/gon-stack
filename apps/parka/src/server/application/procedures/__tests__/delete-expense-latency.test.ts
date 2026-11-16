// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const EXPENSE_ID = '11111111-1111-4111-8111-111111111111';
const EXPENSE = {
  id: EXPENSE_ID,
  merchant: 'Biedronka',
  amount: 42.5,
  category_id: 'c-1',
  created_at: '2026-11-10T10:00:00.000Z',
  date: '2026-11-10',
};

type Result = { data: unknown; error: { code: string } | null };

let results: Record<string, Result> = {};
let calls: string[] = [];

const ok = (data: unknown): Result => ({ data, error: null });

/** Every round trip costs fixed latency, like a real network call. */
const later = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const query = (table: string) => {
  let op = 'select';
  const done = () => {
    calls.push(`${table}.${op}`);
    return later(results[`${table}.${op}`] ?? ok(null));
  };
  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: () => ((op = 'insert'), chain),
    delete: () => ((op = 'delete'), chain),
    eq: () => chain,
    in: () => chain,
    maybeSingle: done,
    then: (resolve: (value: unknown) => unknown) => done().then(resolve),
  };
  return chain;
};

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: () =>
        later({
          data: {
            user: {
              id: 'u-1',
              email: 'anna@parka.test',
              user_metadata: { full_name: 'Anna Kowalska' },
            },
          },
          error: null,
        }),
    },
    from: query,
  }),
}));

const { deleteExpense } = await import('../delete-expense');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

/** Simulated milliseconds until the call settles. */
const elapsedMs = async (call: Promise<unknown>) => {
  let settled = false;
  void call.then(
    () => (settled = true),
    () => (settled = true),
  );
  let elapsed = 0;
  while (!settled && elapsed < LATENCY_MS * 20) {
    await vi.advanceTimersByTimeAsync(1);
    elapsed += 1;
  }
  return elapsed;
};

beforeEach(() => {
  calls = [];
  results = {
    'expenses.select': ok(EXPENSE),
    'expenses.delete': ok([{ id: EXPENSE_ID }]),
    'categories.select': ok([{ id: 'c-1', name: 'Jedzenie' }]),
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('delete expense latency', () => {
  it('finishes in fewer round trips by reading categories alongside the deletes', async () => {
    const call = deleteExpense(async () => ({ id: EXPENSE_ID }), context);

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({ code: 200, ok: true });
    // sign-in, read, items delete, expense delete, notification insert
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 5 + 5);
  });

  it('keeps the expense deleted and raises when the category read fails', async () => {
    results['categories.select'] = { data: null, error: { code: '500' } };

    const call = deleteExpense(async () => ({ id: EXPENSE_ID }), context);
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 500 });
    expect(calls).toContain('expenses.delete');
  });

  it('still says not found without reading notifications', async () => {
    results['expenses.select'] = ok(null);
    results['expenses.delete'] = ok([]);

    const call = deleteExpense(async () => ({ id: EXPENSE_ID }), context);
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 404 });
    expect(calls).not.toContain('notifications.insert');
  });
});
