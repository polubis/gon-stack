import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  createAccount,
  dayFromToday,
  type Account,
  type SeedExpense,
} from './finance-api';

/**
 * The combined read answers exactly what the separate reads answer, for the
 * same account, period and zone: nothing more, nothing less.
 */

const baseURL = (): string => test.info().project.use.baseURL!;

const get = async (http: APIRequestContext, path: string) => {
  const res = await http.get(path);
  return { status: res.status(), body: await res.json() };
};

const FOOD = { id: 'food', name: 'Food', color: '#aa0000' };
const FUN = { id: 'fun', name: 'Fun', color: '#00aa00' };

const EXPENSES: SeedExpense[] = [
  { id: 'a', date: '2026-03-01T00:00:00Z', amount: 20, categoryId: 'food' },
  { id: 'b', date: '2026-03-10T08:00:00Z', amount: 5.5, categoryId: 'fun' },
  {
    id: 'c',
    date: '2026-03-15T12:00:00Z',
    amount: 45,
    categoryId: null,
    deviceId: 'dev-1',
    deviceName: 'Phone',
    items: [
      { id: 'c1', unitPrice: 30, categoryId: 'food' },
      { id: 'c2', unitPrice: 10, quantity: 2, discount: 5, categoryId: 'fun' },
    ],
  },
  { id: 'd', date: '2026-02-28T23:30:00Z', amount: 40, categoryId: 'fun' },
];

type Shape = {
  dashboard: unknown;
  expenses: unknown;
  categories: unknown;
  limits: unknown;
  recurring: unknown;
};

/** The five separate reads for a period, as one object shaped like the bootstrap. */
const separately = async (
  http: APIRequestContext,
  query: string,
  zone: string,
): Promise<Shape> => {
  const [dashboard, expenses, categories, limits, recurring] =
    await Promise.all([
      get(http, `/api/dashboard/?${query}&tz=${zone}`),
      get(http, `/api/expenses/?tz=${zone}`),
      get(http, '/api/categories/'),
      get(http, '/api/limits/'),
      get(http, `/api/recurring/?tz=${zone}`),
    ]);
  return {
    dashboard: dashboard.body.data,
    expenses: expenses.body.data,
    categories: categories.body.data,
    limits: limits.body.data,
    recurring: recurring.body.data,
  };
};

/** Row order of the plain table reads is the database's; compare as sets. */
const canonical = (shape: Shape) => ({
  ...shape,
  categories: sortById(shape.categories),
  limits: sortById(shape.limits),
  recurring: sortById(shape.recurring),
});

const sortById = (rows: unknown) =>
  [...(rows as { id: string }[])].sort((a, b) => (a.id < b.id ? -1 : 1));

test.describe('bootstrap read', () => {
  test.describe.configure({ mode: 'serial' });
  let owner: Account;

  test.beforeAll(async () => {
    owner = await createAccount(baseURL(), 'boot', 'Boot Owner');
    await owner.seed({
      categories: [FOOD, FUN],
      expenses: EXPENSES,
      limits: [
        { id: 'lt', scope: 'total', amount: 900 },
        {
          id: 'lf',
          scope: 'category',
          categoryId: 'food',
          amount: 100,
          alertAt: 50,
        },
      ],
      recurring: [
        {
          id: 'r-weekly',
          name: 'Weekly',
          cost: 8.25,
          categoryId: 'food',
          interval: 'weekly',
          startDate: dayFromToday(-14),
          items: [
            {
              id: 'p1',
              name: 'Rice',
              unitPrice: 4.125,
              quantity: 2,
              categoryId: 'food',
            },
          ],
        },
        {
          id: 'r-later',
          name: 'Later',
          cost: 1,
          categoryId: 'fun',
          startDate: '2099-01-01',
        },
      ],
    });
  });
  test.afterAll(async () => {
    await owner.remove();
  });

  test('it returns the same data as the five separate reads', async () => {
    const query = 'kind=month&from=2026-03-15';
    const boot = await get(owner.http, `/api/bootstrap/?${query}&tz=UTC`);

    expect(boot.status).toBe(200);
    expect(boot.body.code).toBe(200);
    expect(canonical(boot.body.data)).toEqual(
      canonical(await separately(owner.http, query, 'UTC')),
    );
  });

  test('it holds the charges the first read made', async () => {
    const boot = await get(
      owner.http,
      '/api/bootstrap/?kind=month&from=2026-03-15&tz=UTC',
    );
    const charged = boot.body.data.expenses
      .filter(
        (e: { recurringId: string | null }) => e.recurringId === 'r-weekly',
      )
      .map((e: { occurrenceDate: string }) => e.occurrenceDate)
      .sort();

    expect(charged).toEqual(
      [dayFromToday(-14), dayFromToday(-7), dayFromToday(0)].sort(),
    );
  });

  for (const [name, query, zone] of [
    ['a week in Warsaw', 'kind=week&from=2026-03-01', 'Europe/Warsaw'],
    [
      'a year in Los Angeles',
      'kind=year&from=2026-06-01',
      'America/Los_Angeles',
    ],
    ['a custom range', 'kind=custom&from=2026-02-28&to=2026-03-01', 'UTC'],
    ['a future month', 'kind=month&from=2099-01-01', 'UTC'],
  ] as const) {
    test(`it matches the separate reads for ${name}`, async () => {
      const boot = await get(owner.http, `/api/bootstrap/?${query}&tz=${zone}`);

      expect(canonical(boot.body.data)).toEqual(
        canonical(await separately(owner.http, query, zone)),
      );
    });
  }

  test('reading it again creates no further charges', async () => {
    const before = await owner.count('expenses');

    await Promise.all([
      get(owner.http, '/api/bootstrap/?kind=month&from=2026-03-15&tz=UTC'),
      get(owner.http, '/api/bootstrap/?kind=month&from=2026-02-15&tz=UTC'),
    ]);

    expect(await owner.count('expenses')).toBe(before);
  });
});

test.describe('bootstrap access and input', () => {
  test('it refuses a request without a session', async ({ request }) => {
    const res = await request.get('/api/bootstrap/?kind=month&from=2026-03-01');

    expect(res.status()).toBe(401);
    expect(await res.json()).toEqual({
      code: 401,
      type: 'unauthorized',
      message: 'Unauthorized',
    });
  });

  test('it rejects what the dashboard rejects', async () => {
    const user = await createAccount(baseURL(), 'bootbad');
    try {
      for (const [query, message] of [
        ['kind=month&from=2026-03-01&tz=Mars/Base', 'tz: Unknown time zone'],
      ] as const) {
        const res = await get(user.http, `/api/bootstrap/?${query}`);
        expect(res.body).toEqual({
          code: 400,
          type: 'bad-request',
          message: `Invalid request payload: ${message}`,
        });
      }
      for (const query of [
        'from=2026-03-01',
        'kind=month',
        'kind=x&from=2026-03-01',
      ]) {
        const res = await get(user.http, `/api/bootstrap/?${query}`);
        expect(res.status).toBe(400);
      }
    } finally {
      await user.remove();
    }
  });

  test('a new account gets empty data and a zero dashboard', async () => {
    const fresh = await createAccount(baseURL(), 'bootfresh', 'Fresh Boot');
    try {
      const boot = await get(
        fresh.http,
        '/api/bootstrap/?kind=month&from=2026-03-05&tz=UTC',
      );

      expect(boot.body.data).toMatchObject({
        expenses: [],
        categories: [],
        limits: [],
        recurring: [],
        dashboard: {
          total: 0,
          transactions: 0,
          monthlyLimit: null,
          userName: 'Fresh Boot',
        },
      });
    } finally {
      await fresh.remove();
    }
  });

  test('each account gets only its own data', async () => {
    const ann = await createAccount(baseURL(), 'bootann', 'Ann');
    const bob = await createAccount(baseURL(), 'bootbob', 'Bob');
    try {
      await ann.seed({
        categories: [FOOD],
        expenses: [
          {
            id: 'ann-e',
            date: '2026-03-05T10:00:00Z',
            amount: 11,
            categoryId: 'food',
          },
        ],
      });
      await bob.seed({
        categories: [FUN],
        expenses: [
          {
            id: 'bob-e',
            date: '2026-03-05T10:00:00Z',
            amount: 22,
            categoryId: 'fun',
          },
        ],
      });

      const a = await get(
        ann.http,
        '/api/bootstrap/?kind=month&from=2026-03-05&tz=UTC',
      );
      const b = await get(
        bob.http,
        '/api/bootstrap/?kind=month&from=2026-03-05&tz=UTC',
      );

      expect(a.body.data.expenses.map((e: { id: string }) => e.id)).toEqual([
        'ann-e',
      ]);
      expect(b.body.data.expenses.map((e: { id: string }) => e.id)).toEqual([
        'bob-e',
      ]);
      expect([
        a.body.data.dashboard.total,
        b.body.data.dashboard.total,
      ]).toEqual([11, 22]);
    } finally {
      await ann.remove();
      await bob.remove();
    }
  });
});
