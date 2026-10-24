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

export const backlogTask = (overrides: Json = {}): Json => ({
  id: 'b-1',
  title: 'Umówić dentystę',
  description: null,
  categoryId: 'health',
  priorityId: 'medium',
  device: null,
  ...overrides,
});

export const task = (overrides: Json = {}): Json => ({
  id: 't-1',
  title: 'Raport miesięczny',
  description: null,
  categoryId: 'work',
  priorityId: 'high',
  day: '2026-10-20',
  at: '09:00',
  done: false,
  inProgress: false,
  device: null,
  recurringId: null,
  occurrenceDate: null,
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
    backlog: [] as Json[],
    categories: [...CATEGORIES] as Json[],
    priorities: [...PRIORITIES] as Json[],
    failWrites: false,
    /** What the user set for the creating device; the server adds it on create. */
    deviceProfile: null as Json | null,
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

  const withProfile = (body: Json): Json =>
    state.deviceProfile && body.device
      ? {
          ...body,
          device: { ...(body.device as Json), ...state.deviceProfile },
        }
      : body;

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
          backlog: state.backlog,
        },
      });
    }),
    http.post('/api/time/backlog/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.backlog.push(body!);
      return HttpResponse.json({ code: 201, data: withProfile(body!) });
    }),
    http.put('/api/time/backlog/:id/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.backlog = state.backlog.map((t) => (t.id === body!.id ? body! : t));
      return HttpResponse.json({ code: 200, data: body });
    }),
    http.post('/api/time/tasks/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks.push(body!);
      return HttpResponse.json({ code: 201, data: withProfile(body!) });
    }),
    http.put('/api/time/tasks/:id/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      // Giving a backlog task a day moves it onto the board.
      state.backlog = state.backlog.filter((t) => t.id !== body!.id);
      state.tasks = state.tasks.some((t) => t.id === body!.id)
        ? state.tasks.map((t) => (t.id === body!.id ? body! : t))
        : [...state.tasks, body!];
      return HttpResponse.json({ code: 200, data: body });
    }),
    http.delete('/api/time/tasks/:id/', async ({ request, params }) => {
      await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks = state.tasks.filter((t) => t.id !== params.id);
      state.backlog = state.backlog.filter((t) => t.id !== params.id);
      return HttpResponse.json({ code: 200, ok: true });
    }),
    // The server turns the rule's first occurrence into a plain task.
    http.post('/api/time/recurring/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks.push(
        task({
          id: `${body!.id as string}:${body!.startDate as string}`,
          title: body!.title,
          description: body!.description ?? null,
          categoryId: body!.categoryId,
          priorityId: body!.priorityId,
          day: body!.startDate,
          at: body!.at,
          recurringId: body!.id,
          occurrenceDate: body!.startDate,
        }),
      );
      return HttpResponse.json({ code: 201, data: body });
    }),
    http.delete('/api/time/recurring/:id/', async ({ request, params }) => {
      await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.tasks = state.tasks.map((t) =>
        t.recurringId === params.id ? { ...t, recurringId: null } : t,
      );
      return HttpResponse.json({ code: 200, ok: true });
    }),
    http.post('/api/time/categories/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.categories.push(body!);
      return HttpResponse.json({ code: 201, data: body });
    }),
    http.put('/api/time/categories/:id/', async ({ request }) => {
      const body = await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      state.categories = state.categories.map((c) =>
        c.id === body!.id ? body! : c,
      );
      return HttpResponse.json({ code: 200, data: body });
    }),
    // A category that tasks still use stays, like the foreign key does.
    http.delete('/api/time/categories/:id/', async ({ request, params }) => {
      await record(request);
      if (state.failWrites) return HttpResponse.json(FAILURE);
      if (state.tasks.some((t) => t.categoryId === params.id))
        return HttpResponse.json({
          code: 409,
          type: 'conflict',
          message: 'Still referenced by other records',
        });
      state.categories = state.categories.filter((c) => c.id !== params.id);
      return HttpResponse.json({ code: 200, ok: true });
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
    state.backlog = [];
    state.categories = [...CATEGORIES];
    state.priorities = [...PRIORITIES];
    state.failWrites = false;
    state.deviceProfile = null;
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
    seedBacklog: (tasks: Json[]) => {
      state.backlog = [...tasks];
    },
    calls,
    writes: () => calls.filter((call) => call.method !== 'GET'),
    reads: () => calls.filter((call) => call.method === 'GET'),
  };
};
