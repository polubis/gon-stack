// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';

const LATENCY_MS = 25;
const OCCURRENCES = 250;

type Row = Record<string, unknown>;

let tables: Record<string, Row[]> = {};
let trips: string[] = [];
let rowsRead: Record<string, number> = {};
let updatedIds: string[] = [];
let deletedIds: string[] = [];

const later = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

/** Every round trip costs fixed latency, like a real network call. */
const query = (table: string) => {
  let op = 'select';
  const eqs: [string, unknown][] = [];
  const done = () => {
    trips.push(`${table}.${op}`);
    if (op !== 'select') return later({ data: null, error: null });
    const rows = (tables[table] ?? []).filter((row) =>
      eqs.every(([column, value]) => row[column] === value),
    );
    rowsRead[table] = (rowsRead[table] ?? 0) + rows.length;
    return later({ data: rows, error: null });
  };
  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: () => ((op = 'insert'), chain),
    update: () => ((op = 'update'), chain),
    delete: () => ((op = 'delete'), chain),
    eq: (column: string, value: unknown) => (eqs.push([column, value]), chain),
    in: (column: string, values: string[]) => {
      if (table === 'expenses' && op === 'update') updatedIds.push(...values);
      if (table === 'expenses' && op === 'delete') deletedIds.push(...values);
      return chain;
    },
    maybeSingle: () =>
      done().then(({ data }) => ({ data: data?.[0] ?? null, error: null })),
    then: (resolve: (value: unknown) => unknown) => done().then(resolve),
  };
  return chain;
};

const db = { from: query } as unknown as SupabaseServer;

const { deleteSeries, editExpenses, editSeriesRule } =
  await import('../recurring-scope');

const day = (i: number) =>
  new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10);

const IDS = Array.from({ length: OCCURRENCES }, (_, i) => `r-1:${day(i)}`);

const RULE: Row = {
  id: 'r-1',
  user_id: 'u-1',
  name: 'Czynsz',
  cost: 100,
  interval: 'monthly',
  start_date: '2026-01-01',
  end_date: null,
  last_materialized_date: null,
  active: true,
  payment_method: 'card',
  category_id: 'c-1',
};

const item = (id: string, recurringId: string): Row => ({
  id,
  recurring_id: recurringId,
  user_id: 'u-1',
  name: 'Woda',
  unit_price: 10,
  quantity: 1,
  discount: 0,
  category_id: 'c-1',
});

/** Simulated milliseconds until the call settles. */
const elapsedMs = async (call: Promise<unknown>) => {
  let settled = false;
  void call.then(
    () => (settled = true),
    () => (settled = true),
  );
  let elapsed = 0;
  while (!settled && elapsed < LATENCY_MS * 400) {
    await vi.advanceTimersByTimeAsync(1);
    elapsed += 1;
  }
  return elapsed;
};

beforeEach(() => {
  trips = [];
  rowsRead = {};
  updatedIds = [];
  deletedIds = [];
  tables = {
    recurring_expenses: [RULE],
    expenses: IDS.map((id, i) => ({
      id,
      recurring_id: 'r-1',
      occurrence_date: day(i),
    })),
    recurring_items: [
      item('r-1:a', 'r-1'),
      ...Array.from({ length: 40 }, (_, i) => item(`r-9:${i}`, 'r-9')),
    ],
  };
  vi.useFakeTimers();
  return () => vi.useRealTimers();
});

describe('recurring series latency', () => {
  it('deletes a long series in few round trips', async () => {
    const call = deleteSeries(db, 'u-1', 'r-1', day(0), 'all');

    const ms = await elapsedMs(call);
    await call;

    expect([...deletedIds].sort()).toEqual([...IDS].sort());
    // ids + rule read together, chunks deleted together (items, then expenses), rule removed
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 4 + 5);
  });

  it('edits a long series in the time of one chunk', async () => {
    const call = editExpenses(db, 'u-1', IDS, {
      merchant: 'Czynsz',
      amount: 120,
      categoryId: 'c-1',
      paymentMethod: 'card',
      isBill: true,
      items: [
        {
          id: 'x:a',
          name: 'Woda',
          unitPrice: 10,
          quantity: 1,
          discount: 0,
          categoryId: 'c-1',
        },
      ],
    });

    const ms = await elapsedMs(call);
    await call;

    expect([...updatedIds].sort()).toEqual([...IDS].sort());
    // update, wipe items, insert items
    expect(ms).toBeLessThanOrEqual(LATENCY_MS * 3 + 5);
  });

  it('reads only the products of the edited rule when splitting it', async () => {
    const call = editSeriesRule(db, 'u-1', 'r-1', day(60), 'this', {
      name: 'Czynsz',
      cost: 100,
      categoryId: 'c-1',
      paymentMethod: 'card',
      items: [],
    });

    await elapsedMs(call);
    await call;

    expect(rowsRead['recurring_items']).toBe(1);
  });
});
