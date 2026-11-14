import { describe, expect, it } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { materializeTimeRecurring } from '../time';

const LATENCY_MS = 25;
const RULES = 8;

const rule = (n: number) => ({
  user_id: 'u1',
  id: `r${n}`,
  title: `Rule ${n}`,
  description: null,
  category_id: 'c1',
  priority_id: 'p1',
  at: null,
  interval: 'daily',
  start_date: '2026-11-10',
  end_date: null,
  active: true,
  last_materialized_date: null,
});

/** Every round trip costs fixed latency, like a real network call. */
const fakeDb = (rows: ReturnType<typeof rule>[]) => {
  const upserts: { id: string }[] = [];
  const marks: unknown[] = [];
  const later = <T>(value: T) =>
    new Promise<T>((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
  const db = {
    from: (table: string) => {
      if (table === 'time_recurring') {
        const chain = {
          select: () => ({
            eq: () => later({ data: rows, error: null }),
          }),
          update: (patch: unknown) => {
            marks.push(patch);
            return { eq: () => ({ or: () => later({ error: null }) }) };
          },
        };
        return chain;
      }
      return {
        upsert: (batch: { id: string }[]) => {
          upserts.push(...batch);
          return later({ error: null });
        },
      };
    },
  } as unknown as SupabaseServer;
  return { db, upserts, marks };
};

describe('materializing recurring tasks', () => {
  it('creates every due occurrence and marks every rule', async () => {
    const { db, upserts, marks } = fakeDb([rule(1), rule(2)]);

    await materializeTimeRecurring(db, 'u1', '2026-11-11');

    expect(upserts.map((u) => u.id).sort()).toEqual([
      'r1:2026-11-10',
      'r1:2026-11-11',
      'r2:2026-11-10',
      'r2:2026-11-11',
    ]);
    expect(marks).toHaveLength(2);
  });

  it('does not slow down as the number of rules grows', async () => {
    const { db, marks } = fakeDb(
      Array.from({ length: RULES }, (_, i) => rule(i)),
    );
    const started = performance.now();

    await materializeTimeRecurring(db, 'u1', '2026-11-11');

    const elapsed = performance.now() - started;
    console.info(`materialize ${RULES} rules: ${Math.round(elapsed)} ms`);
    expect(marks).toHaveLength(RULES);
    // sequential would need 1 + 2 * RULES round trips
    expect(elapsed).toBeLessThan(LATENCY_MS * (1 + RULES));
  });

  it('fails when a rule cannot be stored', async () => {
    const { db } = fakeDb([rule(1)]);
    const failing = {
      from: (table: string) =>
        table === 'time_recurring'
          ? (db.from as (t: string) => unknown)(table)
          : {
              upsert: () =>
                Promise.resolve({ error: { code: '23503', message: 'x' } }),
            },
    } as unknown as SupabaseServer;

    await expect(
      materializeTimeRecurring(failing, 'u1', '2026-11-11'),
    ).rejects.toBeDefined();
  });
});
