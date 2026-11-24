// @vitest-environment node
import type { APIContext } from 'astro';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const LATENCY_MS = 25;
const CATALOG_ID = '11111111-1111-4111-8111-111111111111';

type Result = { data: unknown; error: { code: string } | null };

let results: Record<string, Result> = {};
let calls: string[] = [];
let removed: string[][] = [];

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
    delete: () => ((op = 'delete'), chain),
    eq: () => chain,
    in: () => chain,
    not: () => chain,
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
    storage: {
      from: () => ({
        remove: (paths: string[]) => {
          removed.push(paths);
          return later(ok([]));
        },
      }),
    },
  }),
}));

const { deleteKnowledgeCatalog } = await import('../delete-knowledge-catalog');

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
  removed = [];
  results = {
    'knowledge_topics.select': ok([{ id: 't-1' }, { id: 't-2' }]),
    'knowledge_reels.select': ok([
      { media_path: 'u-1/r-1/a' },
      { media_path: 'u-1/r-2/b' },
    ]),
    'knowledge_catalogs.delete': ok([{ id: CATALOG_ID }]),
  };
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('delete knowledge catalog latency', () => {
  it('finishes in fewer round trips by reading media in one query', async () => {
    const call = deleteKnowledgeCatalog(
      async () => ({ id: CATALOG_ID }),
      context,
    );

    const ms = await elapsedMs(call);

    expect(await call).toMatchObject({ code: 200, ok: true });
    // sign-in, media read, catalog delete, storage remove
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 4 + 5);
  });

  it('removes the stored files of the catalog reels', async () => {
    const call = deleteKnowledgeCatalog(
      async () => ({ id: CATALOG_ID }),
      context,
    );
    await elapsedMs(call);
    await call;

    expect(removed).toEqual([['u-1/r-1/a', 'u-1/r-2/b']]);
  });

  it('says not found and keeps files when the catalog is gone', async () => {
    results['knowledge_catalogs.delete'] = ok([]);

    const call = deleteKnowledgeCatalog(
      async () => ({ id: CATALOG_ID }),
      context,
    );
    await elapsedMs(call);

    expect(await call).toMatchObject({ code: 404 });
    expect(removed).toEqual([]);
  });

  it('skips storage when the catalog has no files', async () => {
    results['knowledge_reels.select'] = ok([]);

    const call = deleteKnowledgeCatalog(
      async () => ({ id: CATALOG_ID }),
      context,
    );
    await elapsedMs(call);
    await call;

    expect(removed).toEqual([]);
  });
});
