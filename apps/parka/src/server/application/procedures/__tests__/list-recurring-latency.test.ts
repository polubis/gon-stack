// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const RULE = {
  id: 'r-1',
  name: 'Czynsz',
  cost: 1200,
  interval: 'monthly',
  start_date: '2026-01-01',
  end_date: null,
  active: true,
  payment_method: 'card',
  category_id: 'c-1',
  last_materialized_date: null,
};
const ITEM = {
  id: 'r-1:i-1',
  recurring_id: 'r-1',
  name: 'Woda',
  unit_price: 1200,
  quantity: 1,
  discount: 0,
  category_id: 'c-1',
};

const DATA: Record<string, unknown> = {
  recurring_expenses: [RULE],
  recurring_items: [ITEM],
};

let failing: string | null = null;

/** Every round trip costs fixed latency, like a real network call. */
const later = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const query = (table: string) => {
  const done = () =>
    later(
      failing === table
        ? { data: null, error: { code: 'XX000', message: 'boom' } }
        : { data: DATA[table] ?? null, error: null },
    );
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
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

const { listRecurring } = await import('../list-recurring');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

/** Resolves true once the call settles within `rounds` of simulated latency. */
const settlesWithin = async (call: Promise<unknown>, rounds: number) => {
  let settled = false;
  void call.then(
    () => (settled = true),
    () => (settled = true),
  );
  await vi.advanceTimersByTimeAsync(LATENCY_MS * rounds);
  return settled;
};

beforeEach(() => {
  failing = null;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('list recurring latency', () => {
  it('lists rules with products in two round trips with the sign-in lookup', async () => {
    const call = listRecurring(async () => ({}), context);

    expect(await settlesWithin(call, 2)).toBe(true);
    expect(await call).toMatchObject({
      code: 200,
      data: [{ id: 'r-1', name: 'Czynsz', items: [{ name: 'Woda' }] }],
    });
  });

  it('still answers an error when the products read fails', async () => {
    failing = 'recurring_items';
    const call = listRecurring(async () => ({}), context);

    expect(await settlesWithin(call, 2)).toBe(true);
    expect(await call).toMatchObject({ code: 500 });
  });
});
