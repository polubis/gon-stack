import { describe, expect, it } from 'vitest';
import type { SupabaseServer } from '@/shared/data-sources/supabase-server';
import { notifyUnfinishedTasks } from '../time';

type Row = { title: string; at: string | null };

/** Stand-in for the two tables the check touches; records what was stored. */
const fakeDb = (tasks: Row[], totalOpen = tasks.length) => {
  const stored = new Map<string, Record<string, unknown>>();
  const db = {
    from: (table: string) => {
      if (table === 'time_tasks') {
        const countQuery = {
          eq: () => countQuery,
          lte: () => Promise.resolve({ count: totalOpen, error: null }),
        };
        const query = {
          select: (_cols: string, opts?: { head?: boolean }) =>
            opts?.head ? countQuery : query,
          eq: () => query,
          order: () => Promise.resolve({ data: tasks, error: null }),
        };
        return query;
      }
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

const at = (iso: string) => new Date(iso);

describe('unfinished tasks near the end of the day', () => {
  it('warns about tasks still open in the evening', async () => {
    const { db, stored } = fakeDb([{ title: 'Raport', at: '09:00:00' }]);

    await notifyUnfinishedTasks(
      db,
      'u1',
      'Europe/Warsaw',
      at('2026-10-20T18:30:00Z'),
    );

    expect([...stored.values()]).toMatchObject([
      {
        id: 'time-day-unfinished:2026-10-20',
        kind: 'time-day-unfinished',
        payload: {
          day: '2026-10-20',
          tasks: [{ title: 'Raport', at: '09:00' }],
        },
      },
    ]);
  });

  it('adds the overall not-done count and lists today in the text', async () => {
    const { db, stored } = fakeDb(
      [
        { title: 'Raport', at: '09:00:00' },
        { title: 'Bank', at: null },
      ],
      7,
    );

    await notifyUnfinishedTasks(
      db,
      'u1',
      'Europe/Warsaw',
      at('2026-10-20T18:30:00Z'),
    );

    expect([...stored.values()]).toMatchObject([
      {
        payload: { totalOpen: 7 },
        body: 'Dziś: Raport, Bank · Niezrobione łącznie: 7',
      },
    ]);
  });

  it('stays quiet before the evening', async () => {
    const { db, stored } = fakeDb([{ title: 'Raport', at: null }]);

    await notifyUnfinishedTasks(
      db,
      'u1',
      'Europe/Warsaw',
      at('2026-10-20T12:00:00Z'),
    );

    expect(stored.size).toBe(0);
  });

  it('stays quiet when everything is done', async () => {
    const { db, stored } = fakeDb([]);

    await notifyUnfinishedTasks(
      db,
      'u1',
      'Europe/Warsaw',
      at('2026-10-20T19:00:00Z'),
    );

    expect(stored.size).toBe(0);
  });

  it('warns once however often the list is read', async () => {
    const { db, stored } = fakeDb([{ title: 'Raport', at: null }]);
    const now = at('2026-10-20T19:00:00Z');

    await notifyUnfinishedTasks(db, 'u1', 'Europe/Warsaw', now);
    await notifyUnfinishedTasks(db, 'u1', 'Europe/Warsaw', now);

    expect(stored.size).toBe(1);
  });
});
