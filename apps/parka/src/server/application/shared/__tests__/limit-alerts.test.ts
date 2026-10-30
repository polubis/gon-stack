import { describe, expect, it } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { notifyReachedLimits } from '../limit-alerts';

type LimitRow = {
  id: string;
  scope: 'total' | 'category';
  category_id: string | null;
  amount: number;
  alert_at: number;
};

/** Chainable stand-in for a read: every filter returns itself, awaiting yields `data`. */
const read = (data: unknown[]) => {
  const query: Record<string, unknown> = {
    then: (resolve: (value: unknown) => void) => resolve({ data, error: null }),
  };
  for (const name of ['select', 'order', 'range', 'eq'])
    query[name] = () => query;
  return query;
};

const fakeDb = (limits: LimitRow[], expenses: object[]) => {
  const stored = new Map<string, Record<string, unknown>>();
  // What `dashboard_summary` answers for the month: the total and each category's share.
  const month = {
    total: expenses.reduce(
      (sum, e) => sum + Number((e as { amount: number }).amount),
      0,
    ),
    categories: [
      ...new Set(
        expenses.map((e) => (e as { category_id: string }).category_id),
      ),
    ].map((categoryId) => ({
      categoryId,
      amount: expenses
        .filter(
          (e) => (e as { category_id: string }).category_id === categoryId,
        )
        .reduce((sum, e) => sum + Number((e as { amount: number }).amount), 0),
    })),
  };
  const db = {
    rpc: () =>
      Promise.resolve({
        data: {
          ...month,
          previousTotal: 0,
          transactions: 0,
          series: [],
          previousSeries: [],
        },
        error: null,
      }),
    from: (table: string) => {
      if (table === 'limits') return read(limits);
      if (table === 'categories')
        return read([{ id: 'c-1', name: 'Jedzenie' }]);
      return {
        upsert: (row: { id: string }) => ({
          select: () => {
            const isNew = !stored.has(row.id);
            stored.set(row.id, row);
            return Promise.resolve({
              data: isNew ? [{ id: row.id }] : [],
              error: null,
            });
          },
        }),
      };
    },
  } as unknown as SupabaseServer;
  return { db, stored };
};

const FOOD: LimitRow = {
  id: 'l-1',
  scope: 'category',
  category_id: 'c-1',
  amount: 100,
  alert_at: 50,
};

const spend = (amount: number) => ({
  id: 'e-1',
  amount,
  category_id: 'c-1',
});

describe('limit notifications', () => {
  it('notifies once spending reaches the chosen point of the limit', async () => {
    const { db, stored } = fakeDb([FOOD], [spend(60)]);

    await notifyReachedLimits(db, 'u1', '2026-10-12T10:00:00Z');

    expect([...stored.values()]).toMatchObject([
      {
        id: 'limit-reached:l-1:2026-10:50',
        kind: 'limit-reached',
        payload: {
          category: 'Jedzenie',
          amount: 100,
          spent: 60,
          alertAt: 50,
        },
      },
    ]);
  });

  it('stays quiet below the chosen point', async () => {
    const { db, stored } = fakeDb([FOOD], [spend(40)]);

    await notifyReachedLimits(db, 'u1', '2026-10-12T10:00:00Z');

    expect(stored.size).toBe(0);
  });

  it('counts the whole month toward the total limit', async () => {
    const total: LimitRow = {
      id: 'l-0',
      scope: 'total',
      category_id: null,
      amount: 200,
      alert_at: 100,
    };
    const { db, stored } = fakeDb([total], [spend(120), spend(100)]);

    await notifyReachedLimits(db, 'u1', '2026-10-12T10:00:00Z');

    expect([...stored.values()]).toMatchObject([
      { kind: 'limit-reached', payload: { category: null, spent: 220 } },
    ]);
  });

  it('tells about the same limit only once per month', async () => {
    const { db, stored } = fakeDb([FOOD], [spend(60)]);

    await notifyReachedLimits(db, 'u1', '2026-10-12T10:00:00Z');
    await notifyReachedLimits(db, 'u1', '2026-10-13T10:00:00Z');

    expect(stored.size).toBe(1);
  });
});
