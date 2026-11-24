// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const TASK_ID = '11111111-1111-4111-8111-111111111111';

type Result = { data: unknown; error: { code: string } | null; count?: number };

let results: Record<string, Result> = {};
let calls: string[] = [];

const ok = (data: unknown, count = 0): Result => ({
  data,
  error: null,
  count,
});

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
    eq: () => chain,
    single: done,
    maybeSingle: done,
    then: (resolve: (value: unknown) => unknown) => done().then(resolve),
  };
  return chain;
};

vi.mock('cloudflare:workers', () => ({ env: { IMAGES: {} } }));

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
    storage: {
      from: () => ({
        upload: () => {
          calls.push('storage.upload');
          return later({ error: null });
        },
        remove: () => later({ error: null }),
      }),
    },
  }),
}));

const { uploadTaskAttachment } = await import('../upload-task-attachment');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
  locals: { cfContext: { waitUntil: () => {} } },
} as unknown as APIContext;

const send = () =>
  uploadTaskAttachment(
    async () => ({
      id: TASK_ID,
      file: new File(['hello'], 'note.txt', { type: 'text/plain' }),
    }),
    context,
  );

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
    'time_tasks.select': ok({ id: TASK_ID }),
    'time_task_attachments.select': ok(null, 1),
    'time_task_attachments.insert': ok({
      id: 'a-1',
      task_id: TASK_ID,
      name: 'note.txt',
      size: 5,
      mime: 'text/plain',
      status: 'ready',
      created_at: '2026-11-10T10:00:00.000Z',
    }),
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('upload task attachment latency', () => {
  it('finishes in fewer round trips by checking task and count together', async () => {
    const call = send();

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({ code: 201 });
    // sign-in, task + count, storage upload, row insert
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 4 + 5);
  });

  it('says not found when the task is missing', async () => {
    results['time_tasks.select'] = ok(null);

    const call = send();
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 404 });
    expect(calls).not.toContain('storage.upload');
  });

  it('says conflict when the task is full', async () => {
    results['time_task_attachments.select'] = ok(null, 5);

    const call = send();
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 409 });
    expect(calls).not.toContain('storage.upload');
  });
});
