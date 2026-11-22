// @vitest-environment node
import type { APIContext } from 'astro';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Result = { data: unknown; error: { code: string } | null };

const ME = 'u-1';
const ID = '11111111-1111-4111-8111-111111111111';
const CATALOG = '22222222-2222-4222-8222-222222222222';
const TAG = '33333333-3333-4333-8333-333333333333';
const REEL = '44444444-4444-4444-8444-444444444444';
const REEL2 = '55555555-5555-4555-8555-555555555555';

const TOPIC_ROW = {
  id: ID,
  catalog_id: CATALOG,
  title: 'RLS',
  description: '',
  position: 0,
  study_day: null,
  created_at: '2026-11-17T10:00:00.000Z',
  updated_at: '2026-11-17T10:00:00.000Z',
  knowledge_topic_tags: [{ tag_id: TAG }],
  knowledge_reels: [
    { id: REEL, knowledge_reel_progress: { reel_id: REEL } },
    { id: REEL2, knowledge_reel_progress: null },
  ],
};

/** Result per `table.operation`; every write is recorded. */
let results: Record<string, Result> = {};
let eqs: Record<string, [string, unknown][]> = {};
let writes: Record<string, unknown[]> = {};
let signedIn = true;

const ok = (data: unknown): Result => ({ data, error: null });
const fail = (code: string): Result => ({ data: null, error: { code } });

const query = (table: string) => {
  let op = 'select';
  const key = () => `${table}.${op}`;
  const done = () => Promise.resolve(results[key()] ?? ok(null));
  const write = (name: string) => (row: unknown) => {
    op = name;
    (writes[key()] ??= []).push(row);
    return chain;
  };
  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: write('insert'),
    upsert: write('upsert'),
    update: write('update'),
    delete: () => {
      op = 'delete';
      return chain;
    },
    eq: (column: string, value: unknown) => {
      (eqs[key()] ??= []).push([column, value]);
      return chain;
    },
    in: () => chain,
    not: () => chain,
    order: () => chain,
    limit: () => chain,
    maybeSingle: done,
    single: done,
    then: (resolve: (value: Result) => unknown) => done().then(resolve),
  };
  return chain;
};

vi.mock('@/shared/data-sources/supabase-server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: async () =>
        signedIn
          ? {
              data: { user: { id: ME, email: 'anna@parka.test' } },
              error: null,
            }
          : { data: { user: null }, error: null },
    },
    from: query,
  }),
}));

const { createKnowledgeCategory } =
  await import('../create-knowledge-category');
const { createKnowledgeCatalog } = await import('../create-knowledge-catalog');
const { updateKnowledgeTag } = await import('../update-knowledge-tag');
const { deleteKnowledgeCategory } =
  await import('../delete-knowledge-category');
const { createKnowledgeTopic } = await import('../create-knowledge-topic');
const { updateKnowledgeTopic } = await import('../update-knowledge-topic');
const { getKnowledgeTopic } = await import('../get-knowledge-topic');
const { createKnowledgeReel } = await import('../create-knowledge-reel');
const { setKnowledgeProgress } = await import('../set-knowledge-progress');
const { resetKnowledgeProgress } = await import('../reset-knowledge-progress');
const { listKnowledge } = await import('../list-knowledge');
const { createKnowledgeDemo } = await import('../create-knowledge-demo');

const context = {
  request: new Request('http://localhost/api/'),
  cookies: {},
} as unknown as APIContext;

const run = (
  procedure: (
    read: () => Promise<unknown>,
    context: APIContext,
  ) => Promise<unknown>,
  input: unknown,
) => procedure(async () => input, context);

beforeEach(() => {
  results = {};
  eqs = {};
  writes = {};
  signedIn = true;
});

describe('knowledge access', () => {
  it('refuses a signed-out visitor', async () => {
    signedIn = false;

    expect(await run(listKnowledge, {})).toMatchObject({ code: 401 });
  });

  it('refuses malformed input before touching data', async () => {
    const response = await run(createKnowledgeReel, {
      topicId: 'nope',
      body: '',
    });

    expect(response).toMatchObject({ code: 400 });
    expect(writes).toEqual({});
  });
});

describe('knowledge categories and tags', () => {
  it('creates a category for the signed-in owner', async () => {
    results['knowledge_categories.insert'] = ok({
      id: ID,
      name: 'Backend',
      color: '#6366f1',
      position: 0,
    });

    const response = await run(createKnowledgeCategory, { name: ' Backend ' });

    expect(response).toMatchObject({ code: 201, data: { name: 'Backend' } });
    expect(writes['knowledge_categories.insert']).toEqual([
      expect.objectContaining({ user_id: ME, name: 'Backend' }),
    ]);
  });

  it('answers conflict for a taken category name', async () => {
    results['knowledge_categories.insert'] = fail('23505');

    expect(
      await run(createKnowledgeCategory, { name: 'Backend' }),
    ).toMatchObject({ code: 409 });
  });

  it('answers not found when renaming a tag of someone else', async () => {
    results['knowledge_tags.update'] = ok(null);

    const response = await run(updateKnowledgeTag, { id: ID, name: 'sql' });

    expect(response).toMatchObject({ code: 404 });
    expect(eqs['knowledge_tags.update']).toContainEqual(['user_id', ME]);
  });

  it('answers conflict when deleting a used category', async () => {
    results['knowledge_categories.delete'] = fail('23503');

    expect(await run(deleteKnowledgeCategory, { id: ID })).toMatchObject({
      code: 409,
    });
  });
});

describe('knowledge catalogs and topics', () => {
  it('refuses a catalog under a category the owner lacks', async () => {
    results['knowledge_categories.select'] = ok(null);

    const response = await run(createKnowledgeCatalog, {
      name: 'Supabase',
      categoryId: ID,
    });

    expect(response).toMatchObject({ code: 404 });
    expect(writes['knowledge_catalogs.insert']).toBeUndefined();
  });

  it('refuses a topic in a catalog the owner lacks', async () => {
    results['knowledge_catalogs.select'] = ok(null);

    const response = await run(createKnowledgeTopic, {
      catalogId: CATALOG,
      title: 'RLS',
    });

    expect(response).toMatchObject({ code: 404 });
  });

  it('creates a topic with its tags and counts', async () => {
    results['knowledge_catalogs.select'] = ok({ id: CATALOG });
    results['knowledge_topics.insert'] = ok({ id: ID });
    results['knowledge_tags.select'] = ok([{ id: TAG }]);
    results['knowledge_topics.select'] = ok(TOPIC_ROW);

    const response = await run(createKnowledgeTopic, {
      catalogId: CATALOG,
      title: 'RLS',
      tagIds: [TAG],
    });

    expect(response).toMatchObject({
      code: 201,
      data: { tagIds: [TAG], reelCount: 2, doneCount: 1 },
    });
    expect(writes['knowledge_topic_tags.upsert']).toEqual([
      [{ user_id: ME, topic_id: ID, tag_id: TAG }],
    ]);
  });

  it('refuses a tag the owner lacks', async () => {
    results['knowledge_catalogs.select'] = ok({ id: CATALOG });
    results['knowledge_topics.update'] = ok({ id: ID });
    results['knowledge_tags.select'] = ok([]);

    const response = await run(updateKnowledgeTopic, {
      id: ID,
      catalogId: CATALOG,
      title: 'RLS',
      description: '',
      tagIds: [TAG],
    });

    expect(response).toMatchObject({ code: 404 });
    expect(writes['knowledge_topic_tags.upsert']).toBeUndefined();
  });

  it('answers not found for an unknown topic', async () => {
    results['knowledge_topics.select'] = ok(null);

    expect(await run(getKnowledgeTopic, { id: ID })).toMatchObject({
      code: 404,
    });
  });

  it('returns a topic with reels marked done', async () => {
    results['knowledge_topics.select'] = ok(TOPIC_ROW);
    results['knowledge_reels.select'] = ok([
      {
        id: REEL,
        topic_id: ID,
        body: '# Hi',
        position: 0,
        created_at: TOPIC_ROW.created_at,
        updated_at: TOPIC_ROW.updated_at,
        knowledge_reel_progress: { reel_id: REEL },
      },
    ]);

    const response = await run(getKnowledgeTopic, { id: ID });

    expect(response).toMatchObject({
      code: 200,
      data: { topic: { id: ID }, reels: [{ id: REEL, done: true }] },
    });
  });
});

describe('knowledge study days', () => {
  it('plans a new topic on a day', async () => {
    results['knowledge_catalogs.select'] = ok({ id: CATALOG });
    results['knowledge_topics.insert'] = ok({ id: ID });
    results['knowledge_topics.select'] = ok({
      ...TOPIC_ROW,
      study_day: '2026-11-18',
    });

    const response = await run(createKnowledgeTopic, {
      catalogId: CATALOG,
      title: 'RLS',
      studyDay: '2026-11-18',
    });

    expect(response).toMatchObject({
      code: 201,
      data: { studyDay: '2026-11-18' },
    });
    expect(writes['knowledge_topics.insert']).toMatchObject([
      { study_day: '2026-11-18' },
    ]);
  });

  it('moves a topic to the backlog with a null day', async () => {
    results['knowledge_catalogs.select'] = ok({ id: CATALOG });
    results['knowledge_topics.update'] = ok({ id: ID });
    results['knowledge_topics.select'] = ok(TOPIC_ROW);

    const response = await run(updateKnowledgeTopic, {
      id: ID,
      catalogId: CATALOG,
      title: 'RLS',
      description: '',
      tagIds: [],
      studyDay: null,
    });

    expect(response).toMatchObject({ code: 200, data: { studyDay: null } });
    expect(writes['knowledge_topics.update']).toMatchObject([
      { study_day: null },
    ]);
  });

  it('refuses a range with the end before the start', async () => {
    const response = await run(listKnowledge, {
      from: '2026-11-20',
      to: '2026-11-18',
    });

    expect(response).toMatchObject({ code: 400 });
  });

  it('lists only topics planned in the range', async () => {
    results['knowledge_topics.select'] = ok([
      { ...TOPIC_ROW, study_day: '2026-11-18' },
      { ...TOPIC_ROW, id: REEL, study_day: null },
    ]);

    const response = (await run(listKnowledge, {
      from: '2026-11-18',
      to: '2026-11-18',
    })) as { data: { topics: { id: string }[]; summary: { topics: number } } };

    expect(response.data.topics.map((t) => t.id)).toEqual([ID]);
    expect(response.data.summary.topics).toBe(2);
  });
});

describe('knowledge demo course', () => {
  it('reports the existing course without writing anything', async () => {
    results['knowledge_catalogs.select'] = ok({
      id: CATALOG,
      category_id: TAG,
      knowledge_topics: [
        { id: REEL2, position: 1 },
        { id: ID, position: 0 },
      ],
    });

    const response = await run(createKnowledgeDemo, {});

    expect(response).toMatchObject({
      code: 200,
      data: { categoryId: TAG, catalogId: CATALOG, topicIds: [ID, REEL2] },
    });
    expect(writes).toEqual({});
  });
});

describe('knowledge progress', () => {
  it('marks an own reel done', async () => {
    results['knowledge_reels.select'] = ok({ id: ID });

    const response = await run(setKnowledgeProgress, {
      reelId: ID,
      done: true,
    });

    expect(response).toMatchObject({ code: 200, data: { done: true } });
    expect(writes['knowledge_reel_progress.upsert']).toEqual([
      { user_id: ME, reel_id: ID },
    ]);
  });

  it('clears progress when marked not done', async () => {
    results['knowledge_reels.select'] = ok({ id: ID });

    const response = await run(setKnowledgeProgress, {
      reelId: ID,
      done: false,
    });

    expect(response).toMatchObject({ code: 200, data: { done: false } });
    expect(eqs['knowledge_reel_progress.delete']).toContainEqual([
      'reel_id',
      ID,
    ]);
  });

  it('clears the progress of every reel of an own topic', async () => {
    results['knowledge_topics.select'] = ok({ id: ID });
    results['knowledge_reels.select'] = ok([{ id: REEL }, { id: REEL2 }]);

    const response = await run(resetKnowledgeProgress, { id: ID });

    expect(response).toMatchObject({ code: 200, data: { topicId: ID } });
    expect(eqs['knowledge_reel_progress.delete']).toContainEqual([
      'user_id',
      ME,
    ]);
  });

  it('answers not found when resetting the topic of someone else', async () => {
    results['knowledge_topics.select'] = ok(null);

    expect(await run(resetKnowledgeProgress, { id: ID })).toMatchObject({
      code: 404,
    });
  });

  it('answers not found for a reel of someone else', async () => {
    results['knowledge_reels.select'] = ok(null);

    expect(
      await run(setKnowledgeProgress, { reelId: ID, done: true }),
    ).toMatchObject({ code: 404 });
  });
});

describe('list knowledge', () => {
  it('returns the overview with a summary over all topics', async () => {
    results['knowledge_categories.select'] = ok([
      { id: ID, name: 'Backend', color: '#6366f1', position: 0 },
    ]);
    results['knowledge_catalogs.select'] = ok([
      {
        id: CATALOG,
        category_id: ID,
        name: 'Supabase',
        description: '',
        position: 0,
      },
    ]);
    results['knowledge_tags.select'] = ok([{ id: TAG, name: 'sql' }]);
    results['knowledge_topics.select'] = ok([TOPIC_ROW]);

    const response = await run(listKnowledge, { q: 'nothing-matches' });

    expect(response).toMatchObject({
      code: 200,
      data: {
        categories: [{ name: 'Backend' }],
        catalogs: [{ categoryId: ID }],
        tags: [{ name: 'sql' }],
        topics: [],
        summary: { topics: 1, startedTopics: 1, reels: 2, doneReels: 1 },
      },
    });
  });

  it('turns a database failure into an error answer', async () => {
    results['knowledge_topics.select'] = fail('XX000');

    expect(await run(listKnowledge, {})).toMatchObject({ code: 500 });
  });
});
