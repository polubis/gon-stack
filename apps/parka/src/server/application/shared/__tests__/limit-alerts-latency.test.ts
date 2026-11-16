// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { notifyReachedLimits } from '../limit-alerts';

const LATENCY_MS = 25;
const EXPENSES = 600;
const ITEMS_PER_EXPENSE = 5;

const limits = ['l-1', 'l-2', 'l-3'].map((id) => ({
  id,
  scope: 'category' as const,
  category_id: 'c-1',
  amount: 100,
  alert_at: 50,
}));

const expenses = Array.from({ length: EXPENSES }, (_, i) => ({
  id: `e-${i}`,
  amount: 10,
  category_id: 'c-1',
}));

const items = expenses.flatMap((e) =>
  Array.from({ length: ITEMS_PER_EXPENSE }, () => ({
    expense_id: e.id,
    unit_price: 1,
    quantity: 2,
    discount: 0,
    category_id: 'c-2',
  })),
);

/** Fake db where every round trip costs fixed latency; tracks peak overlap. */
const slowDb = () => {
  const stored = new Map<string, Record<string, unknown>>();
  const state = { inFlight: 0, peak: 0, calls: 0 };

  const trip = <T>(data: T) => {
    state.calls += 1;
    state.inFlight += 1;
    state.peak = Math.max(state.peak, state.inFlight);
    return new Promise<{ data: T; error: null }>((resolve) =>
      setTimeout(() => {
        state.inFlight -= 1;
        resolve({ data, error: null });
      }, LATENCY_MS),
    );
  };

  const read = (data: unknown[]) => {
    const query: Record<string, unknown> = {
      then: (resolve: (value: unknown) => unknown) => trip(data).then(resolve),
    };
    for (const name of ['select', 'gte', 'lt', 'in', 'eq'])
      query[name] = () => query;
    return query;
  };

  const db = {
    from: (table: string) => {
      if (table === 'limits') return read(limits);
      if (table === 'expenses') return read(expenses);
      if (table === 'categories')
        return read([{ id: 'c-1', name: 'Jedzenie' }]);
      if (table === 'receipt_items') return read(items);
      return {
        upsert: (row: { id: string }) => ({
          select: async () => {
            const result = await trip(
              stored.has(row.id) ? [] : [{ id: row.id }],
            );
            stored.set(row.id, row);
            return result;
          },
        }),
      };
    },
  } as unknown as SupabaseServer;
  return { db, stored, state };
};

describe('limit notifications latency', () => {
  it('tells about every reached limit with overlapping reads and writes', async () => {
    const { db, stored, state } = slowDb();

    const start = performance.now();
    await notifyReachedLimits(db, 'u1', '2026-10-12T10:00:00Z');
    const ms = performance.now() - start;
    console.info(
      `limit-alerts: ${ms.toFixed(0)} ms, ${state.calls} round trips, peak ${state.peak} in flight`,
    );

    expect([...stored.keys()].sort()).toEqual([
      'limit-reached:l-1:2026-10:50',
      'limit-reached:l-2:2026-10:50',
      'limit-reached:l-3:2026-10:50',
    ]);
    expect(state.peak).toBeGreaterThan(1);
    expect(ms).toBeLessThan(LATENCY_MS * 6);
  });

  it('counts only receipt items of the matching expense toward a category', async () => {
    const { db, stored } = slowDb();

    await notifyReachedLimits(db, 'u1', '2026-10-12T10:00:00Z');

    expect(stored.get('limit-reached:l-1:2026-10:50')).toMatchObject({
      payload: { category: 'Jedzenie', amount: 100, alertAt: 50 },
    });
  });
});
