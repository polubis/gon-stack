import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

type Json = Record<string, unknown>;

export type Call = { method: string; url: string; body?: Json };

export const CATEGORIES = [
  { id: 'work', name: 'Praca', icon: 'briefcase', color: '#2563eb' },
  { id: 'home', name: 'Dom', icon: 'home', color: '#c2410c' },
  { id: 'health', name: 'Zdrowie', icon: 'heart', color: '#0d9488' },
  { id: 'learn', name: 'Nauka', icon: 'graduation', color: '#7c3aed' },
  { id: 'rest', name: 'Odpoczynek', icon: 'coffee', color: '#ca8a04' },
];

export const PRIORITIES = [
  { id: 'low', name: 'Niski', value: 2 },
  { id: 'medium', name: 'Średni', value: 5 },
  { id: 'high', name: 'Wysoki', value: 9 },
];

export const task = (overrides: Json = {}): Json => ({
  id: 't-1',
  title: 'Raport miesięczny',
  categoryId: 'work',
  priorityId: 'high',
  day: '2026-10-20',
  at: '09:00',
  done: false,
  ...overrides,
});

const FAILURE = {
  code: 500,
  type: 'internal-server',
  message: 'Database unavailable',
};

/**
 * In-memory stand-in for `/api/time/**`: answers like the real endpoints and
 * records every call. Not the real server, only its public contract.
 */
export const setupTimeBackend = () => {
  const calls: Call[] = [];
  const state = {
    tasks: [] as Json[],
    categories: [...CATEGORIES] as Json[],
    priorities: [...PRIORITIES] as Json[],
    failWrites: false,
    failReads: false,
    delayMs: 0,
  };

  const record = async (request: Request): Promise<Json | undefined> => {
    const body =
      request.method === 'GET' || request.method === 'DELETE'
        ? undefined
        : ((await request.clone().json()) as Json);
    calls.push({ method: request.method, url: request.url, body });
    return body;
  };

  const server = setupServer(
    http.get('/api/time/', async ({ request }) => {
      await record(request);
      if (state.delayMs) await delay(state.delayMs);
      if (state.failReads) return HttpResponse.json(FAILURE);
      const url = new URL(request.url);
      const from = url.searchParams.get('from') ?? '';
      const to = url.searchParams.get('to') ?? '';
      return HttpResponse.json({
        code: 200,
        data: {
          categories: state.categories,
          priorities: state.priorities,
          tasks: state.tasks.filter(
            (t) => (t.day as string) >= from && (t.day as string) <= to,
          ),
        },
      });
    }),
    http.post('/api/time/tasks/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks.push(body!);
      return HttpResponse.json({ code: 201, data: body });
    }),
    http.put('/api/time/tasks/:id/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks = state.tasks.map((t) => (t.id === body!.id ? body! : t));
      return HttpResponse.json({ code: 200, data: body });
    }),
    http.delete('/api/time/tasks/:id/', async ({ request, params }) => {
      await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks = state.tasks.filter((t) => t.id !== params.id);
      return HttpResponse.json({ code: 200, ok: true });
    }),
    http.post('/api/time/categories/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.categories.push(body!);
      return HttpResponse.json({ code: 201, data: body });
    }),
    http.post('/api/time/priorities/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.priorities.push(body!);
      return HttpResponse.json({ code: 201, data: body });
    }),
  );

  beforeEach(() => {
    calls.length = 0;
    state.tasks = [];
    state.categories = [...CATEGORIES];
    state.priorities = [...PRIORITIES];
    state.failWrites = false;
    state.failReads = false;
    state.delayMs = 0;
  });
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  return {
    state,
    seed: (tasks: Json[]) => {
      state.tasks = [...tasks];
    },
    calls,
    writes: () => calls.filter((call) => call.method !== 'GET'),
    reads: () => calls.filter((call) => call.method === 'GET'),
  };
};
