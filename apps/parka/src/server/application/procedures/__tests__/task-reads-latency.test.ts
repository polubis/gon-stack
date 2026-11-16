// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const TASK = { id: 't-1' };
const HISTORY_ROW = {
  id: '22222222-2222-4222-8222-222222222222',
  kind: 'updated',
  field: 'title',
  old_value: 'Stary',
  new_value: 'Nowy',
  created_at: '2026-11-10T10:00:00.000Z',
  mcp_token_id: null,
  bot_name: null,
  bot_ref: null,
};
const COMMENT_ROW = {
  id: '11111111-1111-4111-8111-111111111111',
  body: 'Zadzwonić',
  created_at: '2026-10-31T10:00:00.000Z',
  edited_at: null,
  mcp_token_id: null,
  bot_name: null,
  bot_ref: null,
};

const DATA: Record<string, unknown> = {
  time_tasks: TASK,
  time_task_comments: [COMMENT_ROW],
  time_task_history: [HISTORY_ROW],
};

let ownTask = true;

/** Every round trip costs fixed latency, like a real network call. */
const later = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const query = (table: string) => {
  const done = () =>
    later({
      data: table === 'time_tasks' && !ownTask ? null : (DATA[table] ?? null),
      error: null,
    });
  const chain: Record<string, unknown> = {
    select: () => chain,
    eq: () => chain,
    in: () => chain,
    order: () => chain,
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

const { listTaskComments } = await import('../list-task-comments');
const { listTaskHistory } = await import('../list-task-history');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

/** Resolves true once the call settles within `rounds` of simulated latency. */
const settlesWithin = async (call: Promise<unknown>, rounds: number) => {
  let settled = false;
  void call.then(() => (settled = true));
  await vi.advanceTimersByTimeAsync(LATENCY_MS * rounds);
  return settled;
};

beforeEach(() => {
  ownTask = true;
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('task reads latency', () => {
  it('lists comments in two round trips with the sign-in lookup', async () => {
    // The auth lookup runs first in the procedure guard, then one parallel batch.
    const call = listTaskComments(async () => ({ id: 't-1' }), context);

    expect(await settlesWithin(call, 2)).toBe(true);
    expect(await call).toMatchObject({
      code: 200,
      data: { items: [{ body: 'Zadzwonić' }] },
    });
  });

  it('lists history in two round trips with the sign-in lookup', async () => {
    const call = listTaskHistory(async () => ({ id: 't-1' }), context);

    expect(await settlesWithin(call, 2)).toBe(true);
    expect(await call).toMatchObject({
      code: 200,
      data: { items: [{ from: 'Stary', to: 'Nowy' }] },
    });
  });

  it('still says not found for a foreign task while reads overlap', async () => {
    ownTask = false;
    const call = listTaskHistory(async () => ({ id: 'foreign' }), context);

    expect(await settlesWithin(call, 2)).toBe(true);
    expect(await call).toMatchObject({ code: 404 });
  });
});
