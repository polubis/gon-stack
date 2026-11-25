// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { notifyUnfinishedTasks } from '../time';

const LATENCY_MS = 40;

/** Fake db where every round trip costs fixed latency; tracks peak overlap. */
const slowDb = () => {
  const stored = new Map<string, Record<string, unknown>>();
  const state = { inFlight: 0, peak: 0, calls: 0 };

  const trip = <T>(data: T) => {
    state.calls += 1;
    state.inFlight += 1;
    state.peak = Math.max(state.peak, state.inFlight);
    return new Promise<T>((resolve) =>
      setTimeout(() => {
        state.inFlight -= 1;
        resolve(data);
      }, LATENCY_MS),
    );
  };

  const db = {
    from: (table: string) => {
      if (table === 'time_tasks') {
        const countQuery = {
          eq: () => countQuery,
          lte: () => trip({ count: 4, error: null }),
        };
        const query = {
          select: (_cols: string, opts?: { head?: boolean }) =>
            opts?.head ? countQuery : query,
          eq: () => query,
          order: () =>
            trip({
              data: [{ title: 'Raport', at: '09:00:00' }],
              error: null,
            }),
        };
        return query;
      }
      return {
        upsert: (row: { id: string }) => ({
          select: async () => {
            const data = await trip(stored.has(row.id) ? [] : [{ id: row.id }]);
            stored.set(row.id, row);
            return { data, error: null };
          },
        }),
      };
    },
  } as unknown as SupabaseServer;
  return { db, stored, state };
};

describe('unfinished tasks latency', () => {
  it('reads today and the open total at once', async () => {
    const { db, stored, state } = slowDb();

    const start = performance.now();
    await notifyUnfinishedTasks(
      db,
      'u1',
      'Europe/Warsaw',
      new Date('2026-10-20T18:30:00Z'),
    );
    const ms = performance.now() - start;
    console.info(
      `time-unfinished: ${ms.toFixed(0)} ms, ${state.calls} round trips, peak ${state.peak} in flight`,
    );

    expect(stored.get('time-day-unfinished:2026-10-20')).toMatchObject({
      payload: { totalOpen: 4, tasks: [{ title: 'Raport', at: '09:00' }] },
    });
    expect(state.peak).toBeGreaterThan(1);
    expect(ms).toBeLessThan(LATENCY_MS * 2.6);
  });
});
