// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';

const LATENCY_MS = 25;
const RULES = 8;

const later = <T>(value: T) =>
  new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

let trips = 0;
let recorded: { rule: { name: string }; days: string[] }[] = [];

vi.mock('../notifications', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../notifications')>()),
  loadCategoryNames: async () => {
    trips += 1;
    return later(new Map([['c1', 'Food']]));
  },
  tryRecordNotifications: async (
    _db: unknown,
    _user: string,
    events: { payload: { rule: { name: string }; days: string[] } }[],
  ) => {
    recorded = events.map((e) => e.payload);
  },
}));

const { materializeRecurring } = await import('../recurring');

const rule = (n: number) => ({
  user_id: 'u1',
  id: `r${n}`,
  name: `Rule ${n}`,
  cost: 10,
  interval: 'weekly',
  start_date: '2026-11-01',
  end_date: null,
  active: true,
  last_materialized_date: null,
  payment_method: 'card',
  category_id: 'c1',
});

/** Every round trip costs fixed latency, like a real network call. */
const fakeDb = (rows: ReturnType<typeof rule>[]) => {
  const marks: string[] = [];
  const trip = <T>(value: T) => {
    trips += 1;
    return later(value);
  };
  const db = {
    from: (table: string) => {
      switch (table) {
        case 'recurring_expenses':
          return {
            select: () => ({ eq: () => trip({ data: rows, error: null }) }),
            update: () => ({
              eq: (_: string, id: string) => {
                marks.push(id);
                return { or: () => trip({ error: null }) };
              },
            }),
          };
        case 'recurring_items':
          return { select: () => trip({ data: [], error: null }) };
        case 'expenses':
          return {
            upsert: (batch: { id: string; occurrence_date: string }[]) => ({
              select: () =>
                trip({
                  data: batch.map((b) => ({
                    occurrence_date: b.occurrence_date,
                  })),
                  error: null,
                }),
            }),
          };
        default:
          throw new Error(`unexpected table ${table}`);
      }
    },
  } as unknown as SupabaseServer;
  return { db, marks };
};

beforeEach(() => {
  trips = 0;
  recorded = [];
});

describe('materializing recurring expenses', () => {
  it('records one accrual per rule with its due days, in rule order', async () => {
    const { db, marks } = fakeDb([rule(1), rule(2)]);

    await materializeRecurring(db, 'u1', '2026-11-10');

    expect(recorded.map((r) => r.rule.name)).toEqual(['Rule 1', 'Rule 2']);
    expect(recorded[0]?.days).toEqual(['2026-11-01', '2026-11-08']);
    expect(marks.sort()).toEqual(['r1', 'r2']);
  });

  it('does not slow down as the number of rules grows', async () => {
    const { db, marks } = fakeDb(
      Array.from({ length: RULES }, (_, i) => rule(i)),
    );
    const started = performance.now();

    await materializeRecurring(db, 'u1', '2026-11-10');

    const elapsed = performance.now() - started;
    console.info(
      `materialize ${RULES} rules: ${Math.round(elapsed)} ms, ${trips} round trips`,
    );
    expect(marks).toHaveLength(RULES);
    expect(recorded).toHaveLength(RULES);
    // sequential would need 2 + 3 * RULES round trips
    expect(elapsed).toBeLessThan(LATENCY_MS * 6);
  });

  it('reads category names once however many rules accrue', async () => {
    const { db } = fakeDb(Array.from({ length: RULES }, (_, i) => rule(i)));

    await materializeRecurring(db, 'u1', '2026-11-10');

    // rules + items + (upsert + mark) per rule + one names read
    expect(trips).toBe(2 + 2 * RULES + 1);
  });

  it('does nothing when no rule is due', async () => {
    const { db } = fakeDb([]);

    await materializeRecurring(db, 'u1', '2026-11-10');

    expect(recorded).toEqual([]);
  });
});
