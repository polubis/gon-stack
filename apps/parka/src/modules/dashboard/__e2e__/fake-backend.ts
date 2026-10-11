import type { Page, Route } from '@playwright/test';
import {
  chargesInPeriods,
  summarizeDashboard,
} from '@/server/domain/dashboard';
import {
  clampPeriod,
  resolvePeriod,
  shiftPeriod,
  todayDay,
  type PeriodKind,
} from '@/shared/period/period';
import type { RecurringSource } from '@/shared/recurring/occurrences';

type Row = { id: string };
type Expense = Row & { date: string; amount: number; categoryId: string };
type Category = Row & { name: string; icon: string; color: string };
type Limit = Row & { scope: 'total' | 'category'; amount: number };
type Recurring = RecurringSource;

export type Seed = {
  categories: Category[];
  expenses: Expense[];
  limits: Limit[];
  recurring: Recurring[];
};

export type Backend = {
  /** Number of API requests matching `method` and `path`. */
  count: (method: string, path: string) => number;
};

/** What the scan endpoint answers for any photo. */
const SCANNED_RECEIPT = {
  merchant: 'Biedronka',
  date: new Date().toISOString(),
  amount: 42.5,
  paymentMethod: 'Karta',
  items: [{ name: 'Chleb', unitPrice: 42.5, quantity: 1, discount: 0 }],
};

const json = (route: Route, body: unknown) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

const replace = <T extends Row>(list: T[], item: T): T[] =>
  list.map((x) => (x.id === item.id ? item : x));

const without = <T extends Row>(list: T[], id: string | undefined): T[] =>
  list.filter((x) => x.id !== id);

/**
 * In-memory stand-in for the API behind the dashboard. Writes change the
 * state and the dashboard summary is computed from that state with the real
 * server-side domain code (recurring charges included), so a test proves the
 * numbers the UI shows after a change, not what a stub was told to say.
 */
export const installBackend = async (
  page: Page,
  seed: Seed,
): Promise<Backend> => {
  const state: Seed = structuredClone(seed);
  const requests: { method: string; path: string }[] = [];

  const summary = (
    kind: PeriodKind,
    from: string,
    to?: string,
    timeZone?: string,
  ) => {
    const today = todayDay(timeZone);
    const period = clampPeriod(resolvePeriod(kind, from, to), today);
    const previous = shiftPeriod(period, -1);
    const charges = chargesInPeriods(state.recurring, [period, previous]);
    const total = state.limits.find((l) => l.scope === 'total');
    return {
      ...summarizeDashboard({
        expenses: [
          ...state.expenses,
          ...charges.map((c) => ({
            date: c.date,
            amount: c.amount,
            categoryId: c.categoryId,
          })),
        ],
        categories: state.categories,
        period,
        previous,
        today,
        monthlyLimit: total ? total.amount : null,
        timeZone,
      }),
      userName: 'Anna',
    };
  };

  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const [, , collection, id] = url.pathname.split('/');
    requests.push({ method, path: url.pathname });

    if (collection === 'dashboard') {
      return json(route, {
        code: 200,
        data: summary(
          (url.searchParams.get('kind') ?? 'month') as PeriodKind,
          url.searchParams.get('from') ?? todayDay(),
          url.searchParams.get('to') ?? undefined,
          url.searchParams.get('tz') ?? undefined,
        ),
      });
    }

    if (collection === 'receipts') {
      return json(route, { code: 200, data: SCANNED_RECEIPT });
    }

    if (collection === 'notifications') {
      return json(route, { code: 200, data: [] });
    }

    if (method === 'GET') {
      const lists = {
        expenses: state.expenses,
        categories: state.categories,
        limits: state.limits,
        recurring: state.recurring,
      } as Record<string, Row[]>;
      if (!(collection in lists)) return route.fallback();
      return json(route, { code: 200, data: lists[collection] });
    }

    if (method === 'DELETE') {
      if (collection === 'expenses')
        state.expenses = without(state.expenses, id);
      if (collection === 'limits') state.limits = without(state.limits, id);
      if (collection === 'recurring')
        state.recurring = without(state.recurring, id);
      return json(route, { code: 200, ok: true });
    }

    const body = request.postDataJSON();
    const created = method === 'POST';
    if (collection === 'expenses')
      state.expenses = created
        ? [...state.expenses, body]
        : replace(state.expenses, body);
    if (collection === 'limits')
      state.limits = created
        ? [...state.limits, body]
        : replace(state.limits, body);
    if (collection === 'recurring')
      state.recurring = created
        ? [...state.recurring, body]
        : replace(state.recurring, body);
    return json(route, { code: created ? 201 : 200, data: body });
  });

  return {
    count: (method, path) =>
      requests.filter((r) => r.method === method && r.path === path).length,
  };
};
