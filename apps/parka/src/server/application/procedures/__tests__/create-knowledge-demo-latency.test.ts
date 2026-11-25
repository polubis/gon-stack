// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const CATEGORY = '22222222-2222-4222-8222-222222222222';
const CATALOG = '33333333-3333-4333-8333-333333333333';
const TOPIC = '44444444-4444-4444-8444-444444444444';

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
    return later(results[`${table}.${op}`] ?? ok([]));
  };
  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: () => ((op = 'insert'), chain),
    delete: () => ((op = 'delete'), chain),
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => chain,
    maybeSingle: () => chain,
    then: (resolve: (value: unknown) => unknown) => done().then(resolve),
  };
  return chain;
};

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: () =>
        later({
          data: { user: { id: 'u-1', email: 'a@parka.test' } },
          error: null,
        }),
    },
    from: query,
  }),
}));

const { createKnowledgeDemo } = await import('../create-knowledge-demo');

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

const run = () => createKnowledgeDemo(async () => ({}), context);

beforeEach(() => {
  calls = [];
  results = {
    'knowledge_catalogs.select': ok(null),
    'knowledge_categories.select': ok([]),
    'knowledge_categories.insert': ok({ id: CATEGORY }),
    'knowledge_tags.select': ok([]),
    'knowledge_tags.insert': ok([]),
    'knowledge_catalogs.insert': ok({ id: CATALOG }),
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('create knowledge demo latency', () => {
  it('finishes in fewer round trips by overlapping independent writes', async () => {
    const call = run();

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({ code: 201 });
    // sign-in, existing check, category+tags together (2), catalog, topics,
    // tag links with reels together
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 7 + 5);
  });

  it('writes topics, tag links and reels of the course', async () => {
    const call = run();
    await elapsedMs(call);
    await call;

    expect(calls).toEqual(
      expect.arrayContaining([
        'knowledge_topics.insert',
        'knowledge_topic_tags.insert',
        'knowledge_reels.insert',
      ]),
    );
  });

  it('removes the catalog when a write fails midway', async () => {
    results['knowledge_reels.insert'] = {
      data: null,
      error: { code: '23503' },
    };

    const call = run();
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 409 });
    expect(calls).toContain('knowledge_catalogs.delete');
  });

  it('only reports an existing demo course without writes', async () => {
    results['knowledge_catalogs.select'] = ok({
      id: CATALOG,
      category_id: CATEGORY,
      knowledge_topics: [{ id: TOPIC, position: 0, created_at: 'x' }],
    });

    const call = run();
    await elapsedMs(call);

    expect(await call).toMatchObject({
      code: 200,
      data: { catalogId: CATALOG, topicIds: [TOPIC] },
    });
    expect(calls.some((c) => c.endsWith('.insert'))).toBe(false);
  });
});
