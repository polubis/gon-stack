// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: null };

const ME = 'u-1';
const LATENCY_MS = 25;

const TASK = {
  id: 't-1',
  key: 'ABC-1',
  user_id: ME,
  title: 'Zadzwonić',
  description: null,
  category_id: 'work',
  priority_id: 'medium',
  day: '2026-11-22',
  at: null,
  done: false,
  in_progress: false,
  status_id: null,
  recurring_id: null,
  occurrence_date: null,
  device_id: null,
  device_name: null,
  device_type: null,
};

let calls: string[] = [];

/** Every call costs fixed latency, like a network round trip. */
const later = (data: unknown) =>
  new Promise<Result>((resolve) =>
    setTimeout(() => resolve({ data, error: null }), LATENCY_MS),
  );

const query = (table: string) => {
  calls.push(table);
  const done = () => later(table === 'device_profiles' ? [] : TASK);
  const chain: Record<string, unknown> = {};
  for (const name of ['select', 'update', 'eq', 'in', 'order']) {
    chain[name] = () => chain;
  }
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

const { updateTimeTask } = await import('../update-time-task');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const body = {
  id: 't-1',
  key: null,
  title: 'Zadzwonić',
  description: null,
  categoryId: 'work',
  priorityId: 'medium',
  day: '2026-11-22',
  at: null,
  done: false,
  inProgress: false,
  statusId: null,
  device: null,
  recurringId: null,
  occurrenceDate: null,
  scope: 'this',
};

beforeEach(() => {
  calls = [];
});

describe('update time task', () => {
  it('updates a task and returns it without waiting for profiles after the write', async () => {
    const start = performance.now();
    const response = await updateTimeTask(async () => body, context);
    const ms = performance.now() - start;

    console.info(
      `update-time-task: ${Math.round(ms)} ms, ${calls.length} calls`,
    );
    expect(response).toMatchObject({
      code: 200,
      data: { id: 't-1', title: 'Zadzwonić', categoryId: 'work' },
    });
    expect(calls).toHaveLength(3);
    expect(ms).toBeLessThan(LATENCY_MS * 2.8);
  });
});
