// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const ID = '11111111-1111-4111-8111-111111111111';
const CATALOG = '22222222-2222-4222-8222-222222222222';
const TAG = '33333333-3333-4333-8333-333333333333';
const TAG2 = '44444444-4444-4444-8444-444444444444';

type Result = { data: unknown; error: { code: string } | null };

let results: Record<string, Result> = {};
let calls: string[] = [];

const ok = (data: unknown): Result => ({ data, error: null });

const TOPIC_ROW = {
  id: ID,
  catalog_id: CATALOG,
  title: 'RLS',
  description: '',
  position: 0,
  study_day: null,
  created_at: '2026-11-17T10:00:00.000Z',
  updated_at: '2026-11-17T10:00:00.000Z',
  knowledge_topic_tags: [{ tag_id: TAG }, { tag_id: TAG2 }],
  knowledge_reels: [],
};

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
    upsert: () => ((op = 'upsert'), chain),
    update: () => ((op = 'update'), chain),
    delete: () => ((op = 'delete'), chain),
    eq: () => chain,
    in: () => chain,
    not: () => chain,
    maybeSingle: done,
    single: done,
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

const { createKnowledgeTopic } = await import('../create-knowledge-topic');
const { updateKnowledgeTopic } = await import('../update-knowledge-topic');

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
    'knowledge_catalogs.select': ok({ id: CATALOG }),
    'knowledge_topics.insert': ok({ id: ID }),
    'knowledge_topics.update': ok({ id: ID }),
    'knowledge_tags.select': ok([{ id: TAG }, { id: TAG2 }]),
    'knowledge_topics.select': ok(TOPIC_ROW),
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('knowledge topic latency', () => {
  it('creates a tagged topic in few round trips', async () => {
    const call = createKnowledgeTopic(
      async () => ({ catalogId: CATALOG, title: 'RLS', tagIds: [TAG, TAG2] }),
      context,
    );

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({
      code: 201,
      data: { tagIds: [TAG, TAG2] },
    });
    // sign-in, catalog and tags checked together, insert, tag links, read back
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 5 + 5);
  });

  it('creates an untagged topic without clearing tags it cannot have', async () => {
    const call = createKnowledgeTopic(
      async () => ({ catalogId: CATALOG, title: 'RLS' }),
      context,
    );

    const ms = await elapsedMs(call);
    await call;

    expect(calls).not.toContain('knowledge_topic_tags.delete');
    // sign-in, catalog check, insert, read back
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 4 + 5);
  });

  it('updates a tagged topic in few round trips', async () => {
    const call = updateKnowledgeTopic(
      async () => ({
        id: ID,
        catalogId: CATALOG,
        title: 'RLS',
        description: '',
        tagIds: [TAG, TAG2],
      }),
      context,
    );

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({ code: 200 });
    expect(calls).toContain('knowledge_topic_tags.upsert');
    expect(calls).toContain('knowledge_topic_tags.delete');
    // sign-in, catalog and tags checked together, update, links added and stale ones dropped together, read back
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 5 + 5);
  });

  it('still drops every tag when the update names none', async () => {
    const call = updateKnowledgeTopic(
      async () => ({
        id: ID,
        catalogId: CATALOG,
        title: 'RLS',
        description: '',
        tagIds: [],
      }),
      context,
    );

    await elapsedMs(call);
    await call;

    expect(calls).toContain('knowledge_topic_tags.delete');
    expect(calls).not.toContain('knowledge_tags.select');
  });

  it("changes nothing when a tag is not the owner's", async () => {
    results['knowledge_tags.select'] = ok([{ id: TAG }]);

    const call = updateKnowledgeTopic(
      async () => ({
        id: ID,
        catalogId: CATALOG,
        title: 'RLS',
        description: '',
        tagIds: [TAG, TAG2],
      }),
      context,
    );
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 404 });
    expect(calls).not.toContain('knowledge_topics.update');
    expect(calls).not.toContain('knowledge_topic_tags.upsert');
  });
});
