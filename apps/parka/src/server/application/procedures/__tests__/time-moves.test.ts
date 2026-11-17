// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { code: string } | null };

const ME = 'u-1';

let result: Result = { data: [], error: null };
let calls: [string, ...unknown[]][] = [];

const query = () => {
  const chain: Record<string, unknown> = {};
  for (const name of ['select', 'eq', 'not', 'gte', 'lt', 'order', 'limit']) {
    chain[name] = (...args: unknown[]) => {
      calls.push([name, ...args]);
      return chain;
    };
  }
  chain.then = (resolve: (value: Result) => unknown) =>
    Promise.resolve(result).then(resolve);
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

const { listTimeMoves } = await import('../list-time-moves');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const run = (input: unknown) =>
  (
    listTimeMoves as unknown as (
      read: () => Promise<unknown>,
      context: APIContext,
    ) => Promise<unknown>
  )(async () => input, context);

beforeEach(() => {
  result = { data: [], error: null };
  calls = [];
});

describe('list time moves', () => {
  it('lists own day changes of tasks as task and instant', async () => {
    result = {
      data: [{ task_id: 't-1', created_at: '2026-10-20T08:00:00.000Z' }],
      error: null,
    };

    const response = await run({ from: '2026-10-19', to: '2026-10-25' });

    expect(response).toEqual({
      code: 200,
      data: { items: [{ taskId: 't-1', at: '2026-10-20T08:00:00.000Z' }] },
    });
    expect(calls).toContainEqual(['eq', 'user_id', ME]);
    expect(calls).toContainEqual(['eq', 'field', 'day']);
  });

  it('answers a failed read with an error code', async () => {
    result = { data: null, error: { code: '42501' } };

    const response = (await run({ from: '2026-10-19', to: '2026-10-25' })) as {
      code: number;
    };

    expect(response.code).not.toBe(200);
  });

  it('refuses a range that ends before it starts', async () => {
    const response = (await run({ from: '2026-10-25', to: '2026-10-19' })) as {
      code: number;
    };

    expect(response.code).toBe(400);
  });
});
