import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

type Call = { method: string; url: string };

type Reads = {
  expenses?: object[];
  categories?: object[];
  limits?: object[];
  recurring?: object[];
};

const SUMMARY = {
  userName: 'Anna Kowalska',
  total: 10,
  change: 0,
  previousTotal: 10,
  transactions: 1,
  dailyAverage: 1,
  series: [{ index: 1, total: 10 }],
  previousSeries: [{ index: 1, total: 10 }],
  monthlyLimit: null,
  categories: [],
};

/** Body of every read the dashboard makes while loading; empty unless given. */
export const readBody = (url: string, reads: Reads = {}) => {
  if (url.includes('avatar')) return { code: 200, data: null };
  // A cold load reads everything at once: the same answers, together.
  if (url.includes('bootstrap'))
    return {
      code: 200,
      data: {
        dashboard: SUMMARY,
        expenses: reads.expenses ?? [],
        categories: reads.categories ?? [],
        limits: reads.limits ?? [],
        recurring: reads.recurring ?? [],
      },
    };
  const data = url.includes('dashboard')
    ? SUMMARY
    : url.includes('expenses')
      ? (reads.expenses ?? [])
      : url.includes('categories')
        ? (reads.categories ?? [])
        : url.includes('limits')
          ? (reads.limits ?? [])
          : (reads.recurring ?? []);
  return { code: 200, data };
};

/** msw handlers for all reads of the dashboard load. */
export const readHandlers = (reads: Reads = {}) =>
  [
    'bootstrap',
    'dashboard',
    'expenses',
    'categories',
    'limits',
    'recurring',
    'avatar',
  ].map((name) =>
    http.get(`/api/${name}/`, ({ request }) =>
      HttpResponse.json(readBody(request.url, reads)),
    ),
  );

/** msw server of a test file: unhandled requests fail, handlers reset per test. */
export const startBackend = () => {
  const server = setupServer();
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  return server;
};

const BOOTSTRAP_PARTS = [
  'dashboard',
  'expenses',
  'categories',
  'limits',
  'recurring',
] as const;

/**
 * The combined cold-load read, answered like the server does: from the same
 * answers the separate reads give. A failing part fails the whole read.
 */
const answerBootstrap = async (
  call: Call,
  respond: (call: Call) => object | Promise<object>,
): Promise<object> => {
  const search = call.url.slice(call.url.indexOf('?'));
  const parts: Record<string, unknown> = {};
  for (const part of BOOTSTRAP_PARTS) {
    const answer = (await respond({
      method: 'GET',
      url: `/api/${part}/${part === 'dashboard' || part === 'expenses' || part === 'recurring' ? search : ''}`,
    })) as { code: number; data?: unknown };
    if (answer.code !== 200) return answer;
    parts[part] = answer.data;
  }
  return { code: 200, data: parts };
};

/** Answers every `/api` request with `respond` and returns the calls it got. */
export const answerApi = (
  server: ReturnType<typeof startBackend>,
  respond: (call: Call) => object | Promise<object>,
) => {
  const calls: Call[] = [];
  server.use(
    http.all('/api/*', async ({ request }) => {
      const { pathname, search } = new URL(request.url);
      const call = { method: request.method, url: pathname + search };
      calls.push(call);
      return HttpResponse.json(
        pathname.startsWith('/api/bootstrap/')
          ? await answerBootstrap(call, respond)
          : await respond(call),
      );
    }),
  );
  return calls;
};
