// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { deleteExpenses, editExpenses } from '../recurring-scope';
import { deleteTimeTasks, editTaskSeries } from '../time-scope';

const LATENCY_MS = 25;
const IDS = Array.from({ length: 500 }, (_, i) => `id-${i}`); // 5 chunks of 100

/** Fake db: every round trip costs fixed latency; logs writes per table. */
const slowDb = () => {
  const state = { calls: 0, writes: [] as string[] };
  const trip = <T>(data: T) => {
    state.calls += 1;
    return new Promise<{ data: T; error: null }>((resolve) =>
      setTimeout(() => resolve({ data, error: null }), LATENCY_MS),
    );
  };
  const query = (table: string, op: string, data: unknown) => {
    const q: Record<string, unknown> = {
      then: (resolve: (value: unknown) => unknown) => {
        state.writes.push(`${op}:${table}`);
        return trip(data).then(resolve);
      },
    };
    for (const name of ['select', 'eq', 'in']) q[name] = () => q;
    return q;
  };
  const db = {
    from: (table: string) => ({
      select: () => query(table, 'select', []),
      delete: () => query(table, 'delete', null),
      update: () => query(table, 'update', null),
      insert: () => query(table, 'insert', null),
    }),
    storage: { from: () => ({ remove: () => trip(null) }) },
  } as unknown as SupabaseServer;
  return { db, state };
};

const time = async (run: () => Promise<void>) => {
  const start = performance.now();
  await run();
  return performance.now() - start;
};

describe('series scope latency', () => {
  it('deletes many expenses without waiting chunk after chunk', async () => {
    const { db, state } = slowDb();

    const ms = await time(() => deleteExpenses(db, IDS));
    console.info(`deleteExpenses: ${ms.toFixed(0)} ms, ${state.calls} trips`);

    expect(state.calls).toBe(10);
    expect(ms).toBeLessThan(LATENCY_MS * 4);
  });

  it('edits many expenses and swaps their items without serial waits', async () => {
    const { db, state } = slowDb();
    const edit = {
      merchant: 'M',
      amount: 1,
      categoryId: null,
      paymentMethod: 'card',
      isBill: false,
      items: [
        {
          id: 'a:1',
          name: 'x',
          unitPrice: 1,
          quantity: 1,
          discount: 0,
          categoryId: 'c1',
        },
      ],
    };

    const ms = await time(() => editExpenses(db, 'u1', IDS, edit));
    console.info(`editExpenses: ${ms.toFixed(0)} ms, ${state.calls} trips`);

    expect(state.calls).toBe(15);
    expect(ms).toBeLessThan(LATENCY_MS * 4);
  });

  it('updates many series tasks without waiting chunk after chunk', async () => {
    const { db, state } = slowDb();
    const edit = {
      title: 'T',
      description: null,
      categoryId: 'c',
      priorityId: 'p',
      at: null,
    };

    const ms = await time(() =>
      editTaskSeries(db, 'u1', 'r1', IDS, 'this', edit),
    );
    console.info(`editTaskSeries: ${ms.toFixed(0)} ms, ${state.calls} trips`);

    expect(state.calls).toBe(5);
    expect(ms).toBeLessThan(LATENCY_MS * 3);
  });

  it('deletes many tasks and their files without waiting chunk after chunk', async () => {
    const { db, state } = slowDb();

    const ms = await time(() => deleteTimeTasks(db, 'u1', IDS));
    console.info(`deleteTimeTasks: ${ms.toFixed(0)} ms, ${state.calls} trips`);

    expect(state.calls).toBe(10);
    expect(ms).toBeLessThan(LATENCY_MS * 4);
  });
});
