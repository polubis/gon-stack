import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { File as NodeFile } from 'node:buffer';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

type Json = Record<string, unknown>;

export type Call = { method: string; url: string; body?: Json };

export const TODAY = '2026-10-20';

export const category = (overrides: Json = {}): Json => ({
  id: 'c-lang',
  name: 'Języki',
  color: '#2563eb',
  position: 0,
  ...overrides,
});

export const catalog = (overrides: Json = {}): Json => ({
  id: 'k-en',
  categoryId: 'c-lang',
  name: 'Angielski',
  description: '',
  position: 0,
  ...overrides,
});

export const topic = (overrides: Json = {}): Json => ({
  id: 't-1',
  catalogId: 'k-en',
  title: 'Phrasal verbs',
  description: 'Czasowniki frazowe',
  position: 0,
  studyDay: TODAY,
  tagIds: [],
  reelCount: 4,
  doneCount: 0,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  ...overrides,
});

export const reel = (overrides: Json = {}): Json => ({
  id: 'r-1',
  topicId: 't-1',
  body: '# Run out of',
  position: 0,
  media: null,
  done: false,
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  ...overrides,
});

const FAILURE = {
  code: 500,
  type: 'internal-server',
  message: 'Database unavailable',
};

const stateOf = (t: Json) =>
  t.doneCount === 0
    ? 'untouched'
    : t.doneCount === t.reelCount
      ? 'done'
      : 'started';

/**
 * In-memory stand-in for `/api/knowledge/**`: answers like the real endpoints
 * (filters, ranges, ids on create) and records every call.
 */
export const setupKnowledgeBackend = () => {
  const calls: Call[] = [];
  let created = 0;
  const state = {
    categories: [] as Json[],
    catalogs: [] as Json[],
    tags: [] as Json[],
    topics: [] as Json[],
    reels: [] as Json[],
    failWrites: false,
    failReads: false,
    failReelReads: false,
    delayMs: 0,
    writeDelayMs: 0,
  };

  const record = async (request: Request): Promise<Json | undefined> => {
    const isJson = request.headers.get('content-type')?.includes('json');
    const text = isJson ? await request.clone().text() : '';
    const body = text ? (JSON.parse(text) as Json) : undefined;
    calls.push({ method: request.method, url: request.url, body });
    return body;
  };

  /** Runs a write: records it, fails or answers like the server. */
  const write = async (
    request: Request,
    answer: (body: Json | undefined) => Json,
  ) => {
    const body = await record(request);
    // The change is stored on arrival, the answer is what gets slow.
    const out = state.failWrites ? FAILURE : answer(body);
    if (state.writeDelayMs) await delay(state.writeDelayMs);
    return HttpResponse.json(out);
  };

  const nextId = () => `srv-${++created}`;

  const collection = (
    path: string,
    key: 'categories' | 'catalogs' | 'tags' | 'topics',
    extra: (body: Json) => Json = () => ({}),
  ) => [
    http.post(path, ({ request }) =>
      write(request, (body) => {
        const item = { id: nextId(), position: 0, ...body, ...extra(body!) };
        state[key].push(item);
        return { code: 201, data: item };
      }),
    ),
    http.put(`${path}:id/`, ({ request, params }) =>
      write(request, (body) => {
        state[key] = state[key].map((i) =>
          i.id === params.id ? { ...i, ...body } : i,
        );
        return {
          code: 200,
          data: state[key].find((i) => i.id === params.id),
        };
      }),
    ),
    http.delete(`${path}:id/`, ({ request, params }) =>
      write(request, () => {
        state[key] = state[key].filter((i) => i.id !== params.id);
        return { code: 200, ok: true };
      }),
    ),
  ];

  const server = setupServer(
    // Header eyebrow asks for the devices; it copes with a failure.
    http.get('/api/settings/', () => HttpResponse.json(FAILURE)),
    http.get('/api/knowledge/', async ({ request }) => {
      await record(request);
      if (state.delayMs) await delay(state.delayMs);
      if (state.failReads) return HttpResponse.json(FAILURE);
      const q = new URL(request.url).searchParams;
      const phrase = q.get('q')?.toLowerCase();
      const scope = q.get('scope');
      const from = q.get('from');
      const to = q.get('to');
      const categoryOf = (t: Json) =>
        state.catalogs.find((c) => c.id === t.catalogId)?.categoryId;
      const topics = state.topics
        .filter((t) => {
          const day = t.studyDay as string | null;
          if (scope === 'undated') return day === null;
          if (from && to && (day === null || day < from || day > to))
            return false;
          return (
            (!phrase ||
              (t.title as string).toLowerCase().includes(phrase) ||
              (t.description as string).toLowerCase().includes(phrase)) &&
            (!q.get('catalogId') || t.catalogId === q.get('catalogId')) &&
            (!q.get('categoryId') || categoryOf(t) === q.get('categoryId')) &&
            (!q.get('tagId') ||
              (t.tagIds as string[]).includes(q.get('tagId')!)) &&
            (!q.get('progress') ||
              q.get('progress') === 'all' ||
              stateOf(t) === q.get('progress'))
          );
        })
        .sort((a, b) =>
          q.get('sort') === 'title'
            ? (a.title as string).localeCompare(b.title as string)
            : (a.position as number) - (b.position as number),
        );
      return HttpResponse.json({
        code: 200,
        data: {
          categories: state.categories,
          catalogs: state.catalogs,
          tags: state.tags,
          topics,
          summary: {
            topics: state.topics.length,
            startedTopics: 0,
            doneTopics: 0,
            reels: 0,
            doneReels: 0,
          },
        },
      });
    }),
    ...collection('/api/knowledge/categories/', 'categories'),
    ...collection('/api/knowledge/catalogs/', 'catalogs'),
    ...collection('/api/knowledge/tags/', 'tags'),
    ...collection('/api/knowledge/topics/', 'topics', () => ({
      reelCount: 0,
      doneCount: 0,
      createdAt: '2026-10-20T10:00:00.000Z',
      updatedAt: '2026-10-20T10:00:00.000Z',
    })),
    http.get('/api/knowledge/topics/:id/', async ({ request, params }) => {
      await record(request);
      if (state.failReads || state.failReelReads)
        return HttpResponse.json(FAILURE);
      const found = state.topics.find((t) => t.id === params.id);
      return HttpResponse.json({
        code: 200,
        data: {
          topic: found,
          reels: state.reels
            .filter((r) => r.topicId === params.id)
            .sort((a, b) => (a.position as number) - (b.position as number)),
        },
      });
    }),
    http.post('/api/knowledge/reels/', ({ request }) =>
      write(request, (body) => {
        const own = state.reels.filter((r) => r.topicId === body!.topicId);
        const item = {
          id: nextId(),
          media: null,
          done: false,
          position: own.length,
          createdAt: '',
          updatedAt: '',
          ...body,
        };
        state.reels.push(item);
        return { code: 201, data: item };
      }),
    ),
    http.put('/api/knowledge/reels/:id/', ({ request, params }) =>
      write(request, (body) => {
        state.reels = state.reels.map((r) =>
          r.id === params.id ? { ...r, ...body } : r,
        );
        return { code: 200, data: state.reels.find((r) => r.id === params.id) };
      }),
    ),
    http.delete('/api/knowledge/reels/:id/', ({ request, params }) =>
      write(request, () => {
        state.reels = state.reels.filter((r) => r.id !== params.id);
        return { code: 200, ok: true };
      }),
    ),
    http.post(
      '/api/knowledge/reels/:id/media/',
      async ({ request, params }) => {
        calls.push({ method: request.method, url: request.url });
        // Multipart body is read as text: enough for the file name and type.
        const raw = await request.clone().text();
        const name = /filename="([^"]+)"/.exec(raw)?.[1] ?? 'file';
        const type = /Content-Type: ([^\r\n]+)/i.exec(raw)?.[1] ?? '';
        const kind = type.startsWith('video/') ? 'video' : 'image';
        if (state.writeDelayMs) await delay(state.writeDelayMs);
        if (state.failWrites) return HttpResponse.json(FAILURE);
        state.reels = state.reels.map((r) =>
          r.id === params.id
            ? { ...r, media: { kind, url: `https://cdn.test/${name}` } }
            : r,
        );
        return HttpResponse.json({
          code: 201,
          data: state.reels.find((r) => r.id === params.id),
        });
      },
    ),
    http.delete('/api/knowledge/reels/:id/media/', ({ request, params }) =>
      write(request, () => {
        state.reels = state.reels.map((r) =>
          r.id === params.id ? { ...r, media: null } : r,
        );
        return {
          code: 200,
          data: state.reels.find((r) => r.id === params.id),
        };
      }),
    ),
    http.put('/api/knowledge/progress/', ({ request }) =>
      write(request, (body) => {
        state.reels = state.reels.map((r) =>
          r.id === body!.reelId ? { ...r, done: body!.done } : r,
        );
        return { code: 200, data: body! };
      }),
    ),
    http.delete('/api/knowledge/topics/:id/progress/', ({ request, params }) =>
      write(request, () => {
        state.reels = state.reels.map((r) =>
          r.topicId === params.id ? { ...r, done: false } : r,
        );
        state.topics = state.topics.map((t) =>
          t.id === params.id ? { ...t, doneCount: 0 } : t,
        );
        return { code: 200, data: { topicId: params.id as string } };
      }),
    ),
    http.post('/api/knowledge/demo/', ({ request }) =>
      write(request, () => {
        state.categories.push(category({ id: 'c-demo', name: 'Bazy danych' }));
        state.catalogs.push(
          catalog({ id: 'k-demo', categoryId: 'c-demo', name: 'Supabase' }),
        );
        state.topics.push(
          topic({ id: 't-demo', catalogId: 'k-demo', title: 'Lekcja 1' }),
        );
        return {
          code: 201,
          data: {
            categoryId: 'c-demo',
            catalogId: 'k-demo',
            topicIds: ['t-demo'],
          },
        };
      }),
    ),
  );

  beforeAll(async () => {
    // jsdom's FormData/File are not the ones Node's fetch accepts: upload bodies go through Node's.
    const Native = (await new Response(new URLSearchParams()).formData())
      .constructor as typeof FormData;
    vi.stubGlobal(
      'FormData',
      class extends Native {
        override set(name: string, value: string | Blob, fileName?: string) {
          if (typeof value === 'string') return super.set(name, value);
          const file = value as File;
          return super.set(
            name,
            new NodeFile(['x'], fileName ?? file.name ?? 'file', {
              type: file.type,
            }) as unknown as Blob,
          );
        }
      },
    );
    server.listen({ onUnhandledRequest: 'error' });
  });
  beforeEach(() => {
    calls.length = 0;
    created = 0;
    state.categories = [category()];
    state.catalogs = [catalog()];
    state.tags = [];
    state.topics = [];
    state.reels = [];
    state.failWrites = false;
    state.failReads = false;
    state.failReelReads = false;
    state.delayMs = 0;
    state.writeDelayMs = 0;
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => {
    server.close();
    vi.unstubAllGlobals();
  });

  return {
    state,
    calls,
    /** Writes only, in order. */
    writes: () => calls.filter((c) => c.method !== 'GET'),
    /** List reads (`GET /api/knowledge/`). */
    lists: () =>
      calls.filter(
        (c) =>
          c.method === 'GET' && new URL(c.url).pathname === '/api/knowledge/',
      ),
  };
};
