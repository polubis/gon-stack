import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  createAccount,
  dayFromToday,
  type Account,
  type SeedExpense,
} from './finance-api';

/**
 * Characterization of every finance GET: exact JSON for synthetic accounts.
 * The suite describes what callers see today, so it must stay green across
 * any change in how the numbers are computed or stored.
 */

const baseURL = (): string => test.info().project.use.baseURL!;

type Row = {
  id: string;
  amount: number;
  categoryId: string | null;
  lastMaterializedDate: string | null;
  items: { id: string }[];
};
type DashData = {
  total: number;
  transactions: number;
  dailyAverage: number;
  monthlyLimit: number | null;
  userName: string;
  series: { index: number; total: number }[];
  previousSeries: { index: number; total: number }[];
  categories: { categoryId: string }[];
};
/** A list answer or a dashboard answer, whichever the endpoint gives. */
type Json = {
  status: number;
  body: {
    code: number;
    type?: string;
    message?: string;
    data: Row[] & DashData;
  };
};

const get = async (http: APIRequestContext, path: string): Promise<Json> => {
  const res = await http.get(path);
  return { status: res.status(), body: await res.json() };
};

const sortedById = <T extends { id: string }>(rows: T[]): T[] =>
  [...rows].sort((a, b) => (a.id < b.id ? -1 : 1));

const ZONE = 'tz=UTC';

// ---------------------------------------------------------------------------
// Dashboard fixtures
// ---------------------------------------------------------------------------

const FOOD = { id: 'food', name: 'Food', color: '#aa0000' };
const FUN = { id: 'fun', name: 'Fun', color: '#00aa00' };
const HOME = { id: 'home', name: 'Home', color: '#0000aa' };
const IDLE = { id: 'idle', name: 'Idle', color: '#777777' };

const LEDGER: SeedExpense[] = [
  // Year before: one inside the year in UTC, in the next one in Warsaw.
  { id: 'y1', date: '2025-12-31T23:30:00Z', amount: 30, categoryId: 'home' },
  { id: 'y2', date: '2025-06-15T12:00:00Z', amount: 70, categoryId: 'food' },
  // February: the previous period of March.
  { id: 'f0', date: '2026-02-17T12:00:00Z', amount: 8, categoryId: 'fun' },
  { id: 'f1', date: '2026-02-10T10:00:00Z', amount: 100, categoryId: 'food' },
  { id: 'f2', date: '2026-02-28T12:00:00Z', amount: 10, categoryId: 'food' },
  { id: 'f3', date: '2026-02-28T23:30:00Z', amount: 40, categoryId: 'fun' },
  // March, around the month edges and the DST jumps.
  { id: 'm1', date: '2026-03-01T00:00:00Z', amount: 20, categoryId: 'food' },
  { id: 'm2', date: '2026-03-10T08:00:00Z', amount: 5.5, categoryId: 'food' },
  { id: 'm3', date: '2026-03-10T09:15:00Z', amount: 6.5, categoryId: 'fun' },
  { id: 'm4', date: '2026-03-10T18:00:00Z', amount: 7, categoryId: 'food' },
  {
    id: 'm5',
    date: '2026-03-15T12:00:00Z',
    amount: 45,
    categoryId: null,
    items: [
      { id: 'm5a', unitPrice: 30, categoryId: 'food' },
      { id: 'm5b', unitPrice: 10, quantity: 2, discount: 5, categoryId: 'fun' },
    ],
  },
  {
    id: 'm6',
    date: '2026-03-20T12:00:00Z',
    amount: 12,
    categoryId: 'home',
    items: [{ id: 'm6a', unitPrice: 99, categoryId: 'food' }],
  },
  {
    id: 'm10',
    date: '2026-03-22T12:00:00Z',
    amount: 10,
    categoryId: null,
    items: [
      { id: 'm10a', unitPrice: 10, quantity: 0.5, categoryId: 'food' },
      {
        id: 'm10b',
        unitPrice: 4,
        quantity: 1.5,
        discount: 1,
        categoryId: 'fun',
      },
    ],
  },
  { id: 'm9', date: '2026-03-25T12:00:00Z', amount: 0.5, categoryId: 'food' },
  // No category and no products: counts in totals, in no slice.
  { id: 'm11', date: '2026-03-26T12:00:00Z', amount: 4, categoryId: null },
  { id: 'm7', date: '2026-03-31T21:59:59Z', amount: 3, categoryId: 'fun' },
  { id: 'm8', date: '2026-03-31T22:30:00Z', amount: 9, categoryId: 'food' },
  { id: 'a1', date: '2026-04-01T10:00:00Z', amount: 11, categoryId: 'fun' },
];

type Slice = { category: typeof FOOD; amount: number };

type Summary = {
  total: number;
  previousTotal: number;
  transactions: number;
  /** Days the daily average divides by. */
  elapsed: number;
  length: number;
  previousLength: number;
  /** Bucket (1-based) -> total, everything else is zero. */
  series: Record<number, number>;
  previousSeries: Record<number, number>;
  slices: Slice[];
  monthlyLimit?: number | null;
  userName?: string;
};

const zeros = (length: number, filled: Record<number, number>) =>
  Array.from({ length }, (_, i) => ({
    index: i + 1,
    total: filled[i + 1] ?? 0,
  }));

/** The dashboard answer: the rules of change, average and share, spelled out. */
const dashboard = (s: Summary) => ({
  code: 200,
  data: {
    total: s.total,
    change:
      s.previousTotal === 0
        ? 0
        : ((s.total - s.previousTotal) / s.previousTotal) * 100,
    previousTotal: s.previousTotal,
    userName: s.userName ?? 'Ledger Owner',
    transactions: s.transactions,
    dailyAverage: s.elapsed === 0 ? 0 : s.total / s.elapsed,
    series: zeros(s.length, s.series),
    previousSeries: zeros(s.previousLength, s.previousSeries),
    monthlyLimit: s.monthlyLimit === undefined ? 3000 : s.monthlyLimit,
    categories: s.slices.map(({ category, amount }) => ({
      categoryId: category.id,
      name: category.name,
      color: category.color,
      amount,
      pct: (amount / s.total) * 100,
    })),
  },
});

const dash = (kind: string, from: string, zone: string, to?: string) =>
  `/api/dashboard/?kind=${kind}&from=${from}${to ? `&to=${to}` : ''}${zone ? `&${zone}` : ''}`;

test.describe('dashboard', () => {
  test.describe.configure({ mode: 'serial' });
  let ledger: Account;

  test.beforeAll(async () => {
    ledger = await createAccount(baseURL(), 'ledger', 'Ledger Owner');
    await ledger.seed({
      categories: [FOOD, FUN, HOME, IDLE],
      expenses: LEDGER,
      limits: [
        { id: 'lim-total', scope: 'total', amount: 3000 },
        { id: 'lim-food', scope: 'category', categoryId: 'food', amount: 500 },
      ],
    });
  });
  test.afterAll(async () => {
    await ledger.remove();
  });

  test('a month in UTC adds up days, slices and the previous month', async () => {
    const res = await get(ledger.http, dash('month', '2026-03-15', ZONE));

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      dashboard({
        total: 122.5,
        previousTotal: 158,
        transactions: 11,
        elapsed: 31,
        length: 31,
        previousLength: 28,
        series: {
          1: 20,
          10: 19,
          15: 45,
          20: 12,
          22: 10,
          25: 0.5,
          26: 4,
          31: 12,
        },
        previousSeries: { 10: 100, 17: 8, 28: 50 },
        slices: [
          { category: FOOD, amount: 77 },
          { category: FUN, amount: 29.5 },
          { category: HOME, amount: 12 },
        ],
      }),
    );
  });

  test('any day of the month selects the same month', async () => {
    const first = await get(ledger.http, dash('month', '2026-03-01', ZONE));
    const last = await get(ledger.http, dash('month', '2026-03-31', ZONE));

    expect(last.body).toEqual(first.body);
  });

  test('a month in Warsaw moves midnight expenses across the edges', async () => {
    const res = await get(
      ledger.http,
      dash('month', '2026-03-15', 'tz=Europe/Warsaw'),
    );

    expect(res.body).toEqual(
      dashboard({
        total: 153.5,
        previousTotal: 118,
        transactions: 11,
        elapsed: 31,
        length: 31,
        previousLength: 28,
        series: {
          1: 60,
          10: 19,
          15: 45,
          20: 12,
          22: 10,
          25: 0.5,
          26: 4,
          31: 3,
        },
        previousSeries: { 10: 100, 17: 8, 28: 10 },
        slices: [
          { category: FUN, amount: 69.5 },
          { category: FOOD, amount: 68 },
          { category: HOME, amount: 12 },
        ],
      }),
    );
  });

  test('a month in Los Angeles reads the late February evening as February', async () => {
    const res = await get(
      ledger.http,
      dash('month', '2026-03-15', 'tz=America/Los_Angeles'),
    );

    expect(res.body).toEqual(
      dashboard({
        total: 102.5,
        previousTotal: 178,
        transactions: 10,
        elapsed: 31,
        length: 31,
        previousLength: 28,
        series: { 10: 19, 15: 45, 20: 12, 22: 10, 25: 0.5, 26: 4, 31: 12 },
        previousSeries: { 10: 100, 17: 8, 28: 70 },
        slices: [
          { category: FOOD, amount: 57 },
          { category: FUN, amount: 29.5 },
          { category: HOME, amount: 12 },
        ],
      }),
    );
  });

  test('a day adds up every expense of that day', async () => {
    const res = await get(ledger.http, dash('day', '2026-03-10', ZONE));

    expect(res.body).toEqual(
      dashboard({
        total: 19,
        previousTotal: 0,
        transactions: 3,
        elapsed: 1,
        length: 1,
        previousLength: 1,
        series: { 1: 19 },
        previousSeries: {},
        slices: [
          { category: FOOD, amount: 12.5 },
          { category: FUN, amount: 6.5 },
        ],
      }),
    );
  });

  test('a day with nothing in it is empty, not an error', async () => {
    const res = await get(ledger.http, dash('day', '2026-03-12', ZONE));

    expect(res.body).toEqual(
      dashboard({
        total: 0,
        previousTotal: 0,
        transactions: 0,
        elapsed: 1,
        length: 1,
        previousLength: 1,
        series: {},
        previousSeries: {},
        slices: [],
      }),
    );
  });

  test('a week starts on Monday and compares with the week before', async () => {
    const res = await get(ledger.http, dash('week', '2026-03-01', ZONE));

    expect(res.body).toEqual(
      dashboard({
        total: 70,
        previousTotal: 8,
        transactions: 3,
        elapsed: 7,
        length: 7,
        previousLength: 7,
        series: { 6: 50, 7: 20 },
        previousSeries: { 2: 8 },
        slices: [
          { category: FOOD, amount: 30 },
          { category: FUN, amount: 40 },
        ].sort((a, b) => b.amount - a.amount),
      }),
    );
  });

  test('a year is read month by month', async () => {
    const res = await get(ledger.http, dash('year', '2025-08-20', ZONE));

    expect(res.body).toEqual(
      dashboard({
        total: 100,
        previousTotal: 0,
        transactions: 2,
        elapsed: 365,
        length: 12,
        previousLength: 12,
        series: { 6: 70, 12: 30 },
        previousSeries: {},
        slices: [
          { category: FOOD, amount: 70 },
          { category: HOME, amount: 30 },
        ],
      }),
    );
  });

  test('a year in Warsaw takes the new-year-eve evening into the next year', async () => {
    const res = await get(
      ledger.http,
      dash('year', '2025-08-20', 'tz=Europe/Warsaw'),
    );

    expect(res.body).toEqual(
      dashboard({
        total: 70,
        previousTotal: 0,
        transactions: 1,
        elapsed: 365,
        length: 12,
        previousLength: 12,
        series: { 6: 70 },
        previousSeries: {},
        slices: [{ category: FOOD, amount: 70 }],
      }),
    );
  });

  test('a short custom range counts day by day', async () => {
    const res = await get(
      ledger.http,
      dash('custom', '2026-02-28', ZONE, '2026-03-01'),
    );

    expect(res.body).toEqual(
      dashboard({
        total: 70,
        previousTotal: 0,
        transactions: 3,
        elapsed: 2,
        length: 2,
        previousLength: 2,
        series: { 1: 50, 2: 20 },
        previousSeries: {},
        slices: [
          { category: FUN, amount: 40 },
          { category: FOOD, amount: 30 },
        ],
      }),
    );
  });

  test('a swapped custom range means the same range', async () => {
    const straight = await get(
      ledger.http,
      dash('custom', '2026-02-28', ZONE, '2026-03-01'),
    );
    const swapped = await get(
      ledger.http,
      dash('custom', '2026-03-01', ZONE, '2026-02-28'),
    );

    expect(swapped.body).toEqual(straight.body);
  });

  test('a custom range without an end shows the seven days up to it', async () => {
    const custom = await get(ledger.http, dash('custom', '2026-03-01', ZONE));
    const week = await get(ledger.http, dash('week', '2026-03-01', ZONE));

    expect(custom.body).toEqual({
      code: 200,
      data: { ...week.body.data },
    });
  });

  test('a long custom range is read month by month', async () => {
    const res = await get(
      ledger.http,
      dash('custom', '2026-01-01', ZONE, '2026-04-30'),
    );

    expect(res.body).toEqual(
      dashboard({
        total: 291.5,
        previousTotal: 30,
        transactions: 16,
        elapsed: 120,
        length: 4,
        previousLength: 4,
        series: { 2: 158, 3: 122.5, 4: 11 },
        previousSeries: { 4: 30 },
        slices: [
          { category: FOOD, amount: 187 },
          { category: FUN, amount: 88.5 },
          { category: HOME, amount: 12 },
        ],
      }),
    );
  });

  test('a future period snaps to the present one', async () => {
    const future = await get(ledger.http, dash('month', '2099-01-10', ZONE));
    const present = await get(
      ledger.http,
      dash('month', dayFromToday(0), ZONE),
    );

    expect(future.status).toBe(200);
    expect(future.body).toEqual(present.body);
  });

  test('a custom range reaching into the future stops at today', async () => {
    const open = await get(
      ledger.http,
      dash('custom', '2026-03-01', ZONE, '2099-12-31'),
    );
    const closed = await get(
      ledger.http,
      dash('custom', '2026-03-01', ZONE, dayFromToday(0)),
    );

    expect(open.body).toEqual(closed.body);
  });

  test('the present month divides by the days passed so far', async () => {
    const today = dayFromToday(0);
    const live = await createAccount(baseURL(), 'live', 'Live Owner');
    try {
      await live.seed({
        categories: [FOOD],
        expenses: [
          {
            id: 'now',
            date: `${today}T00:00:01Z`,
            amount: 90,
            categoryId: 'food',
          },
        ],
      });

      const res = await get(live.http, dash('month', today, ZONE));
      const dayOfMonth = Number(today.slice(8, 10));

      expect(res.body.data.total).toBe(90);
      expect(res.body.data.dailyAverage).toBe(90 / dayOfMonth);
      expect(res.body.data.series[dayOfMonth - 1]).toEqual({
        index: dayOfMonth,
        total: 90,
      });
      expect(res.body.data.monthlyLimit).toBeNull();
    } finally {
      await live.remove();
    }
  });

  test('a month before any data is all zeros with no slices', async () => {
    const res = await get(ledger.http, dash('month', '2020-01-01', ZONE));

    expect(res.body).toEqual(
      dashboard({
        total: 0,
        previousTotal: 0,
        transactions: 0,
        elapsed: 31,
        length: 31,
        previousLength: 31,
        series: {},
        previousSeries: {},
        slices: [],
      }),
    );
  });

  test('leap-year February has twenty-nine days', async () => {
    const res = await get(ledger.http, dash('month', '2024-02-10', ZONE));

    expect(res.body.data.series).toHaveLength(29);
    expect(res.body.data.previousSeries).toHaveLength(31);
  });
});

test.describe('dashboard zones', () => {
  test.describe.configure({ mode: 'serial' });
  let account: Account;

  test.beforeAll(async () => {
    account = await createAccount(baseURL(), 'zones', 'Zone Owner');
    await account.seed({
      categories: [FOOD],
      expenses: [
        {
          id: 'z1',
          date: '2026-06-15T18:45:00Z',
          amount: 10,
          categoryId: 'food',
        },
        {
          id: 'z2',
          date: '2026-06-15T09:00:00Z',
          amount: 5,
          categoryId: 'food',
        },
      ],
    });
  });
  test.afterAll(async () => {
    await account.remove();
  });

  const day = (
    zone: string,
    from: string,
    total: number,
    previousTotal: number,
  ) => ({
    zone,
    from,
    expected: dashboard({
      total,
      previousTotal,
      transactions: total === 0 ? 0 : total === 15 ? 2 : 1,
      elapsed: 1,
      length: 1,
      previousLength: 1,
      series: total ? { 1: total } : {},
      previousSeries: previousTotal ? { 1: previousTotal } : {},
      slices: total ? [{ category: FOOD, amount: total }] : [],
      monthlyLimit: null,
      userName: 'Zone Owner',
    }),
  });

  for (const c of [
    day('UTC', '2026-06-15', 15, 0),
    day('UTC', '2026-06-16', 0, 15),
    day('Asia/Kolkata', '2026-06-15', 5, 0),
    day('Asia/Kolkata', '2026-06-16', 10, 5),
    day('Pacific/Kiritimati', '2026-06-15', 5, 0),
    day('Pacific/Kiritimati', '2026-06-16', 10, 5),
    day('Pacific/Pago_Pago', '2026-06-14', 5, 0),
    day('Pacific/Pago_Pago', '2026-06-15', 10, 5),
    day('America/Los_Angeles', '2026-06-15', 15, 0),
  ]) {
    test(`day ${c.from} in ${c.zone} holds what happened on that local day`, async () => {
      const res = await get(account.http, dash('day', c.from, `tz=${c.zone}`));

      expect(res.body).toEqual(c.expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

const DEVICE = {
  id: 'dev-1',
  name: 'Phone',
  type: 'mobile',
  avatar: null,
  model: null,
  os: null,
  browser: null,
  screen: null,
  customName: null,
  photo: null,
};

test.describe('lists', () => {
  test.describe.configure({ mode: 'serial' });
  let shop: Account;

  test.beforeAll(async () => {
    shop = await createAccount(baseURL(), 'shop', 'Shop Owner');
    await shop.seed({
      categories: [
        { id: 'groceries', name: 'Groceries', color: '#112233', icon: 'cart' },
        { id: 'travel', name: 'Travel', color: '#445566', icon: 'plane' },
      ],
      expenses: [
        {
          id: 'x1',
          date: '2026-05-03T10:00:00Z',
          amount: 30.5,
          categoryId: 'groceries',
          merchant: 'Lidl',
          deviceId: 'dev-1',
          deviceName: 'Phone',
          items: [
            {
              id: 'i1',
              name: 'Milk',
              unitPrice: 2.5,
              quantity: 2,
              discount: 0.5,
              categoryId: 'groceries',
            },
            {
              id: 'i2',
              name: 'Bread',
              unitPrice: 3,
              categoryId: 'groceries',
            },
          ],
        },
        {
          id: 'x2',
          date: '2026-05-04T08:00:00Z',
          amount: 99,
          categoryId: 'travel',
          merchant: 'Train',
          isBill: true,
          paymentMethod: 'transfer',
        },
        {
          id: 'x3',
          date: '2026-05-02T08:00:00Z',
          amount: 15,
          categoryId: null,
          merchant: 'Mixed',
          items: [
            { id: 'i3', name: 'Bus', unitPrice: 5, categoryId: 'travel' },
            { id: 'i4', name: 'Tea', unitPrice: 10, categoryId: 'groceries' },
          ],
        },
        {
          id: 'x4',
          date: '2026-05-04T09:00:00Z',
          amount: 0,
          categoryId: 'groceries',
          merchant: 'Free sample',
        },
      ],
      limits: [
        { id: 'l-total', scope: 'total', amount: 1000 },
        {
          id: 'l-food',
          scope: 'category',
          categoryId: 'groceries',
          amount: 200.5,
          alertAt: 90,
        },
      ],
      recurring: [
        {
          id: 'r-gym',
          name: 'Gym',
          cost: 12,
          categoryId: 'travel',
          interval: 'weekly',
          startDate: '2099-01-01',
        },
        {
          id: 'r-box',
          name: 'Box',
          cost: 14,
          categoryId: 'groceries',
          interval: 'yearly',
          startDate: '2099-02-03',
          endDate: '2099-12-31',
          active: false,
          items: [
            {
              id: 'ri-1',
              name: 'Apples',
              unitPrice: 2,
              quantity: 3,
              discount: 1,
              categoryId: 'groceries',
            },
          ],
        },
      ],
    });
  });
  test.afterAll(async () => {
    await shop.remove();
  });

  test('expenses come newest first with their products and device', async () => {
    const res = await get(shop.http, `/api/expenses/?${ZONE}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      code: 200,
      data: [
        {
          id: 'x4',
          merchant: 'Free sample',
          date: '2026-05-04T09:00:00+00:00',
          amount: 0,
          categoryId: 'groceries',
          paymentMethod: 'card',
          isBill: false,
          source: 'manual',
          device: null,
          recurringId: null,
          occurrenceDate: null,
          items: [],
        },
        {
          id: 'x2',
          merchant: 'Train',
          date: '2026-05-04T08:00:00+00:00',
          amount: 99,
          categoryId: 'travel',
          paymentMethod: 'transfer',
          isBill: true,
          source: 'manual',
          device: null,
          recurringId: null,
          occurrenceDate: null,
          items: [],
        },
        {
          id: 'x1',
          merchant: 'Lidl',
          date: '2026-05-03T10:00:00+00:00',
          amount: 30.5,
          categoryId: 'groceries',
          paymentMethod: 'card',
          isBill: false,
          source: 'manual',
          device: DEVICE,
          recurringId: null,
          occurrenceDate: null,
          items: [
            {
              id: 'i1',
              name: 'Milk',
              unitPrice: 2.5,
              quantity: 2,
              discount: 0.5,
              categoryId: 'groceries',
            },
            {
              id: 'i2',
              name: 'Bread',
              unitPrice: 3,
              quantity: 1,
              discount: 0,
              categoryId: 'groceries',
            },
          ],
        },
        {
          id: 'x3',
          merchant: 'Mixed',
          date: '2026-05-02T08:00:00+00:00',
          amount: 15,
          categoryId: null,
          paymentMethod: 'card',
          isBill: false,
          source: 'manual',
          device: null,
          recurringId: null,
          occurrenceDate: null,
          items: [
            {
              id: 'i3',
              name: 'Bus',
              unitPrice: 5,
              quantity: 1,
              discount: 0,
              categoryId: 'travel',
            },
            {
              id: 'i4',
              name: 'Tea',
              unitPrice: 10,
              quantity: 1,
              discount: 0,
              categoryId: 'groceries',
            },
          ],
        },
      ],
    });
  });

  test('expenses without a zone answer the same', async () => {
    const withZone = await get(shop.http, `/api/expenses/?${ZONE}`);
    const without = await get(shop.http, '/api/expenses/');

    expect(without.body).toEqual(withZone.body);
  });

  test('categories list every field', async () => {
    const res = await get(shop.http, '/api/categories/');

    expect(res.status).toBe(200);
    expect({ ...res.body, data: sortedById(res.body.data) }).toEqual({
      code: 200,
      data: [
        { id: 'groceries', name: 'Groceries', icon: 'cart', color: '#112233' },
        { id: 'travel', name: 'Travel', icon: 'plane', color: '#445566' },
      ],
    });
  });

  test('limits list the total and the category scope', async () => {
    const res = await get(shop.http, '/api/limits/');

    expect(res.status).toBe(200);
    expect({ ...res.body, data: sortedById(res.body.data) }).toEqual({
      code: 200,
      data: [
        {
          id: 'l-food',
          scope: 'category',
          categoryId: 'groceries',
          amount: 200.5,
          alertAt: 90,
        },
        { id: 'l-total', scope: 'total', amount: 1000, alertAt: 80 },
      ],
    });
  });

  test('recurring rules list with their products and no charge yet', async () => {
    const res = await get(shop.http, '/api/recurring/');

    expect(res.status).toBe(200);
    expect({ ...res.body, data: sortedById(res.body.data) }).toEqual({
      code: 200,
      data: [
        {
          id: 'r-box',
          name: 'Box',
          cost: 14,
          interval: 'yearly',
          startDate: '2099-02-03',
          endDate: '2099-12-31',
          lastMaterializedDate: null,
          active: false,
          paymentMethod: 'card',
          categoryId: 'groceries',
          items: [
            {
              id: 'ri-1',
              name: 'Apples',
              unitPrice: 2,
              quantity: 3,
              discount: 1,
              categoryId: 'groceries',
            },
          ],
        },
        {
          id: 'r-gym',
          name: 'Gym',
          cost: 12,
          interval: 'weekly',
          startDate: '2099-01-01',
          endDate: null,
          lastMaterializedDate: null,
          active: true,
          paymentMethod: 'card',
          categoryId: 'travel',
          items: [],
        },
      ],
    });
  });

  test('rules that are not due charge nothing, even when read with a zone', async () => {
    await get(shop.http, `/api/recurring/?${ZONE}`);
    await get(shop.http, `/api/dashboard/?kind=month&from=2026-05-01&${ZONE}`);

    expect(await shop.count('expenses')).toBe(4);
  });

  test('the dashboard counts the shop expenses once', async () => {
    const res = await get(shop.http, dash('month', '2026-05-20', ZONE));

    expect(res.body.data.total).toBe(144.5);
    expect(res.body.data.transactions).toBe(4);
    expect(res.body.data.categories).toEqual([
      {
        categoryId: 'travel',
        name: 'Travel',
        color: '#445566',
        amount: 104,
        pct: (104 / 144.5) * 100,
      },
      {
        categoryId: 'groceries',
        name: 'Groceries',
        color: '#112233',
        amount: 40.5,
        pct: (40.5 / 144.5) * 100,
      },
    ]);
    expect(res.body.data.monthlyLimit).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// Recurring materialization
// ---------------------------------------------------------------------------

test.describe('recurring charges', () => {
  test.describe.configure({ mode: 'serial' });
  let owner: Account;
  const weeklyStart = dayFromToday(-14);

  test.beforeAll(async () => {
    owner = await createAccount(baseURL(), 'rec', 'Rec Owner');
    await owner.seed({
      categories: [FOOD, HOME],
      recurring: [
        {
          id: 'r-weekly',
          name: 'Weekly box',
          cost: 8.25,
          categoryId: 'food',
          interval: 'weekly',
          startDate: weeklyStart,
        },
        {
          id: 'r-later',
          name: 'Later',
          cost: 1,
          categoryId: 'food',
          startDate: dayFromToday(5),
        },
        {
          id: 'r-ended',
          name: 'Ended',
          cost: 40,
          categoryId: 'home',
          startDate: '2026-01-15',
          endDate: '2026-03-20',
        },
        {
          id: 'r-paused',
          name: 'Paused',
          cost: 3,
          categoryId: 'home',
          startDate: '2026-01-01',
          active: false,
        },
        {
          id: 'r-items',
          name: 'Basket',
          cost: 20,
          categoryId: 'food',
          startDate: '2026-04-10',
          endDate: '2026-04-30',
          items: [
            {
              id: 'p1',
              name: 'Rice',
              unitPrice: 5,
              quantity: 2,
              categoryId: 'food',
            },
            {
              id: 'p2',
              name: 'Soap',
              unitPrice: 12,
              discount: 2,
              categoryId: 'home',
            },
          ],
        },
      ],
    });
  });
  test.afterAll(async () => {
    await owner.remove();
  });

  test('reading without a zone charges nothing', async () => {
    const list = await get(owner.http, '/api/expenses/');
    const rules = await get(owner.http, '/api/recurring/');

    expect(list.body.data).toEqual([]);
    expect(rules.body.data.every((r) => r.lastMaterializedDate === null)).toBe(
      true,
    );
  });

  test('the first read with a zone turns due occurrences into expenses', async () => {
    const list = await get(owner.http, `/api/expenses/?${ZONE}`);

    const ids = list.body.data.map((e) => e.id).sort();
    expect(ids).toEqual(
      [
        `r-weekly:${dayFromToday(-14)}`,
        `r-weekly:${dayFromToday(-7)}`,
        `r-weekly:${dayFromToday(0)}`,
        'r-ended:2026-01-15',
        'r-ended:2026-02-15',
        'r-ended:2026-03-15',
        'r-items:2026-04-10',
      ].sort(),
    );
  });

  test('a charge is a bill with the rule name, cost and noon UTC instant', async () => {
    const list = await get(owner.http, `/api/expenses/?${ZONE}`);
    const charge = list.body.data.find(
      (e) => e.id === `r-weekly:${dayFromToday(-7)}`,
    )!;

    expect(charge).toEqual({
      id: `r-weekly:${dayFromToday(-7)}`,
      merchant: 'Weekly box',
      date: `${dayFromToday(-7)}T12:00:00+00:00`,
      amount: 8.25,
      categoryId: 'food',
      paymentMethod: 'card',
      isBill: true,
      source: 'manual',
      device: null,
      recurringId: 'r-weekly',
      occurrenceDate: dayFromToday(-7),
      items: [],
    });
  });

  test('a charge gets its own copy of the rule products', async () => {
    const list = await get(owner.http, `/api/expenses/?${ZONE}`);
    const charge = list.body.data.find((e) => e.id === 'r-items:2026-04-10')!;

    expect(charge.amount).toBe(20);
    expect(charge.categoryId).toBe('food');
    expect(sortedById(charge.items)).toEqual([
      {
        id: 'r-items:2026-04-10:p1',
        name: 'Rice',
        unitPrice: 5,
        quantity: 2,
        discount: 0,
        categoryId: 'food',
      },
      {
        id: 'r-items:2026-04-10:p2',
        name: 'Soap',
        unitPrice: 12,
        quantity: 1,
        discount: 2,
        categoryId: 'home',
      },
    ]);
  });

  test('rules remember how far they were caught up', async () => {
    const rules = await get(owner.http, '/api/recurring/');
    const marks = Object.fromEntries(
      rules.body.data.map((r) => [r.id, r.lastMaterializedDate]),
    );

    expect(marks).toEqual({
      'r-weekly': dayFromToday(0),
      'r-later': null,
      'r-ended': '2026-03-15',
      'r-paused': null,
      'r-items': '2026-04-10',
    });
  });

  test('reading again, in any order, creates nothing new', async () => {
    const before = await owner.count('expenses');
    const itemsBefore = await owner.count('receipt_items');

    await Promise.all([
      get(owner.http, `/api/expenses/?${ZONE}`),
      get(owner.http, `/api/recurring/?${ZONE}`),
      get(owner.http, dash('month', '2026-04-01', ZONE)),
      get(owner.http, `/api/expenses/?${ZONE}`),
    ]);

    expect(await owner.count('expenses')).toBe(before);
    expect(await owner.count('receipt_items')).toBe(itemsBefore);
  });

  test('a charge counts in the dashboard of its month', async () => {
    const res = await get(owner.http, dash('month', '2026-04-15', ZONE));

    expect(res.body.data.total).toBe(20);
    expect(res.body.data.transactions).toBe(1);
    expect(res.body.data.series[9]).toEqual({ index: 10, total: 20 });
    expect(res.body.data.categories).toEqual([
      {
        categoryId: 'food',
        name: 'Food',
        color: '#aa0000',
        amount: 20,
        pct: 100,
      },
    ]);
  });

  test('a deleted charge does not come back', async () => {
    const res = await owner.http.delete('/api/expenses/r-ended:2026-02-15/', {
      headers: { 'Content-Type': 'application/json' },
    });
    expect(res.ok()).toBe(true);

    const list = await get(owner.http, `/api/expenses/?${ZONE}`);
    expect(list.body.data.map((e) => e.id)).not.toContain('r-ended:2026-02-15');
  });
});

// ---------------------------------------------------------------------------
// Access
// ---------------------------------------------------------------------------

const READS = [
  `/api/dashboard/?kind=month&from=2026-03-01&${ZONE}`,
  `/api/expenses/?${ZONE}`,
  '/api/categories/',
  '/api/limits/',
  `/api/recurring/?${ZONE}`,
];

test.describe('access', () => {
  for (const path of READS) {
    test(`${path.split('?')[0]} refuses a request without a session`, async ({
      request,
    }) => {
      const res = await request.get(path);

      expect(res.status()).toBe(401);
      expect(await res.json()).toEqual({
        code: 401,
        type: 'unauthorized',
        message: 'Unauthorized',
      });
    });

    test(`${path.split('?')[0]} refuses a request with a broken session`, async ({
      request,
    }) => {
      const res = await request.get(path, {
        headers: { cookie: 'parka-active=nobody; parka-acct.x=garbage' },
      });

      expect(res.status()).toBe(401);
    });
  }

  test.describe('two accounts', () => {
    test.describe.configure({ mode: 'serial' });
    let ann: Account;
    let bob: Account;

    test.beforeAll(async () => {
      ann = await createAccount(baseURL(), 'ann', 'Ann');
      bob = await createAccount(baseURL(), 'bob', 'Bob');
      await ann.seed({
        categories: [{ id: 'ann-cat', name: 'Ann cat' }],
        expenses: [
          {
            id: 'ann-e',
            date: '2026-03-05T10:00:00Z',
            amount: 11,
            categoryId: 'ann-cat',
          },
        ],
        limits: [{ id: 'ann-l', scope: 'total', amount: 100 }],
        recurring: [
          {
            id: 'ann-r',
            name: 'Ann rule',
            cost: 1,
            categoryId: 'ann-cat',
            startDate: '2099-01-01',
          },
        ],
      });
      await bob.seed({
        categories: [{ id: 'bob-cat', name: 'Bob cat' }],
        expenses: [
          {
            id: 'bob-e',
            date: '2026-03-05T10:00:00Z',
            amount: 22,
            categoryId: 'bob-cat',
          },
        ],
        limits: [{ id: 'bob-l', scope: 'total', amount: 200 }],
        recurring: [
          {
            id: 'bob-r',
            name: 'Bob rule',
            cost: 2,
            categoryId: 'bob-cat',
            startDate: '2099-01-01',
          },
        ],
      });
    });
    test.afterAll(async () => {
      await ann.remove();
      await bob.remove();
    });

    test('each account lists only its own rows', async () => {
      const ids = async (account: Account, path: string) =>
        (await get(account.http, path)).body.data.map((r) => r.id);

      expect(await ids(ann, `/api/expenses/?${ZONE}`)).toEqual(['ann-e']);
      expect(await ids(bob, `/api/expenses/?${ZONE}`)).toEqual(['bob-e']);
      expect(await ids(ann, '/api/categories/')).toEqual(['ann-cat']);
      expect(await ids(bob, '/api/categories/')).toEqual(['bob-cat']);
      expect(await ids(ann, '/api/limits/')).toEqual(['ann-l']);
      expect(await ids(bob, '/api/limits/')).toEqual(['bob-l']);
      expect(await ids(ann, '/api/recurring/')).toEqual(['ann-r']);
      expect(await ids(bob, '/api/recurring/')).toEqual(['bob-r']);
    });

    test('each dashboard counts only its own expenses and limit', async () => {
      const a = await get(ann.http, dash('month', '2026-03-05', ZONE));
      const b = await get(bob.http, dash('month', '2026-03-05', ZONE));

      expect([
        a.body.data.total,
        a.body.data.monthlyLimit,
        a.body.data.userName,
      ]).toEqual([11, 100, 'Ann']);
      expect([
        b.body.data.total,
        b.body.data.monthlyLimit,
        b.body.data.userName,
      ]).toEqual([22, 200, 'Bob']);
      expect(a.body.data.categories.map((c) => c.categoryId)).toEqual([
        'ann-cat',
      ]);
    });
  });

  test('a new account sees empty lists and an empty dashboard', async () => {
    const fresh = await createAccount(baseURL(), 'fresh', 'Fresh One');
    try {
      expect((await get(fresh.http, `/api/expenses/?${ZONE}`)).body).toEqual({
        code: 200,
        data: [],
      });
      expect((await get(fresh.http, '/api/categories/')).body).toEqual({
        code: 200,
        data: [],
      });
      expect((await get(fresh.http, '/api/limits/')).body).toEqual({
        code: 200,
        data: [],
      });
      expect((await get(fresh.http, `/api/recurring/?${ZONE}`)).body).toEqual({
        code: 200,
        data: [],
      });
      expect(
        (await get(fresh.http, dash('month', '2026-03-05', ZONE))).body,
      ).toEqual(
        dashboard({
          total: 0,
          previousTotal: 0,
          transactions: 0,
          elapsed: 31,
          length: 31,
          previousLength: 28,
          series: {},
          previousSeries: {},
          slices: [],
          monthlyLimit: null,
          userName: 'Fresh One',
        }),
      );
    } finally {
      await fresh.remove();
    }
  });
});

test.describe('settings devices', () => {
  test('devices come newest first, one each, named by their newest expense', async () => {
    const owner = await createAccount(baseURL(), 'devices', 'Device Owner');
    try {
      await owner.seed({
        categories: [FOOD],
        expenses: [
          {
            id: 'a1',
            date: '2026-01-01T10:00:00Z',
            amount: 1,
            categoryId: 'food',
            deviceId: 'dA',
            deviceName: 'A old name',
          },
          {
            id: 'a2',
            date: '2026-03-01T10:00:00Z',
            amount: 1,
            categoryId: 'food',
            deviceId: 'dA',
            deviceName: 'A new name',
          },
          {
            id: 'b1',
            date: '2026-05-01T10:00:00Z',
            amount: 1,
            categoryId: 'food',
            deviceId: 'dB',
            deviceName: 'B',
          },
          {
            id: 'c1',
            date: '2026-02-01T10:00:00Z',
            amount: 1,
            categoryId: 'food',
            deviceId: 'dC',
            deviceName: 'C',
          },
        ],
      });

      const res = await get(owner.http, '/api/settings/');

      expect(
        (
          res.body.data as unknown as {
            devices: { id: string; name: string }[];
          }
        ).devices.map((d) => [d.id, d.name]),
      ).toEqual([
        ['dB', 'B'],
        ['dA', 'A new name'],
        ['dC', 'C'],
      ]);
    } finally {
      await owner.remove();
    }
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

test.describe('input validation', () => {
  let user: Account;

  test.beforeAll(async () => {
    user = await createAccount(baseURL(), 'valid');
  });
  test.afterAll(async () => {
    await user.remove();
  });

  const BAD = [
    ['a missing kind', '/api/dashboard/?from=2026-03-01', 'kind'],
    ['an unknown kind', '/api/dashboard/?kind=decade&from=2026-03-01', 'kind'],
    ['a missing start day', '/api/dashboard/?kind=month', 'from'],
    [
      'a malformed start day',
      '/api/dashboard/?kind=month&from=03-01-2026',
      'from',
    ],
    [
      'a malformed end day',
      '/api/dashboard/?kind=custom&from=2026-03-01&to=soon',
      'to',
    ],
    [
      'an unknown zone',
      '/api/dashboard/?kind=month&from=2026-03-01&tz=Mars/Base',
      'tz',
    ],
  ] as const;

  for (const [name, path, field] of BAD) {
    test(`the dashboard rejects ${name}`, async () => {
      const res = await get(user.http, path);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
      expect(res.body.type).toBe('bad-request');
      expect(res.body.message).toMatch(
        new RegExp(`^Invalid request payload: .*\\b${field}:`),
      );
    });
  }

  test('an unknown zone says so', async () => {
    const res = await get(
      user.http,
      '/api/dashboard/?kind=month&from=2026-03-01&tz=Mars/Base',
    );

    expect(res.body).toEqual({
      code: 400,
      type: 'bad-request',
      message: 'Invalid request payload: tz: Unknown time zone',
    });
  });

  for (const path of [
    '/api/expenses/?tz=Mars/Base',
    '/api/recurring/?tz=Mars/Base',
  ]) {
    test(`${path.split('?')[0]} rejects an unknown zone`, async () => {
      const res = await get(user.http, path);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        code: 400,
        type: 'bad-request',
        message: 'Invalid request payload: tz: Unknown time zone',
      });
    });
  }
});
