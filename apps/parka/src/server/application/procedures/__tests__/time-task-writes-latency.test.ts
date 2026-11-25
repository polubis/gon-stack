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
  for (const name of [
    'select',
    'update',
    'upsert',
    'eq',
    'is',
    'in',
    'order',
  ]) {
    chain[name] = () => chain;
  }
  chain.maybeSingle = done;
  chain.single = done;
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

const { createTimeTask } = await import('../create-time-task');
const { createTimeBacklogTask } = await import('../create-time-backlog-task');
const { updateTimeBacklogTask } = await import('../update-time-backlog-task');
const { sendTimeTaskToBacklog } = await import('../send-time-task-to-backlog');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const backlog = {
  id: 't-1',
  title: 'Zadzwonić',
  description: null,
  categoryId: 'work',
  priorityId: 'medium',
  device: null,
};

const timed = {
  ...backlog,
  day: '2026-11-22',
  at: null,
  done: false,
  inProgress: false,
  statusId: null,
  recurringId: null,
  occurrenceDate: null,
};

beforeEach(() => {
  calls = [];
});

const measure = async (name: string, run: () => Promise<unknown>) => {
  const start = performance.now();
  const response = await run();
  const ms = performance.now() - start;
  console.info(`${name}: ${Math.round(ms)} ms, ${calls.length} calls`);
  return { response, ms };
};

describe('time task writes', () => {
  it('creates a task without waiting for profiles after the write', async () => {
    const { response, ms } = await measure('create-time-task', () =>
      createTimeTask(async () => timed, context),
    );

    expect(response).toMatchObject({
      code: 201,
      data: { id: 't-1', title: 'Zadzwonić' },
    });
    expect(calls).toHaveLength(2);
    expect(ms).toBeLessThan(LATENCY_MS * 1.8);
  });

  it('creates a backlog task without waiting for profiles after the write', async () => {
    const { response, ms } = await measure('create-time-backlog-task', () =>
      createTimeBacklogTask(async () => backlog, context),
    );

    expect(response).toMatchObject({ code: 201, data: { id: 't-1' } });
    expect(calls).toHaveLength(2);
    expect(ms).toBeLessThan(LATENCY_MS * 1.8);
  });

  it('updates a backlog task without waiting for profiles after the write', async () => {
    const { response, ms } = await measure('update-time-backlog-task', () =>
      updateTimeBacklogTask(async () => backlog, context),
    );

    expect(response).toMatchObject({ code: 200, data: { id: 't-1' } });
    expect(calls).toHaveLength(2);
    expect(ms).toBeLessThan(LATENCY_MS * 1.8);
  });

  it('sends a task to the backlog without waiting for profiles after the write', async () => {
    const { response, ms } = await measure('send-time-task-to-backlog', () =>
      sendTimeTaskToBacklog(async () => ({ id: 't-1' }), context),
    );

    expect(response).toMatchObject({ code: 200, data: { id: 't-1' } });
    expect(calls).toHaveLength(2);
    expect(ms).toBeLessThan(LATENCY_MS * 1.8);
  });
});
