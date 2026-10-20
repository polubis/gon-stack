import { describe, expect, it } from 'vitest';
import { diffRows, diffText } from '../domain/diff';
import type {
  ExpenseSnapshot,
  Notification,
  NotificationId,
} from '../domain/models';

const expense = (patch: Partial<ExpenseSnapshot> = {}): ExpenseSnapshot => ({
  merchant: 'Biedronka',
  amount: 45.2,
  date: '2026-10-12T10:00:00.000Z',
  category: 'Spożywcze',
  paymentMethod: 'Karta',
  isBill: false,
  ...patch,
});

const base = {
  id: 'n-1' as NotificationId,
  title: 'T',
  body: 'B',
  createdAt: '2026-10-12T10:00:00.000Z',
  read: false,
};

describe('diff of a notification', () => {
  it('shows every field of a created expense as added', () => {
    const n: Notification = {
      ...base,
      kind: 'expense-created',
      payload: { expense: expense() },
    };

    const rows = diffRows(n);

    expect(rows.every((r) => r.before === null && r.after !== null)).toBe(true);
    expect(rows.map((r) => r.label)).toContain('Sprzedawca');
  });

  it('shows every field of a deleted expense as removed', () => {
    const n: Notification = {
      ...base,
      kind: 'expense-deleted',
      payload: { expense: expense() },
    };

    expect(
      diffRows(n).every((r) => r.after === null && r.before !== null),
    ).toBe(true);
  });

  it('lists only the fields an edit changed', () => {
    const n: Notification = {
      ...base,
      kind: 'expense-updated',
      payload: {
        before: expense({ merchant: 'Biedronka' }),
        after: expense({ merchant: 'Lidl' }),
      },
    };

    expect(diffRows(n)).toEqual([
      { label: 'Sprzedawca', before: 'Biedronka', after: 'Lidl' },
    ]);
  });

  it('has nothing to show for a legacy notification', () => {
    expect(diffRows({ ...base, kind: 'other', payload: null })).toEqual([]);
  });

  it('lists the charged days of a recurring expense', () => {
    const n: Notification = {
      ...base,
      kind: 'recurring-accrued',
      payload: {
        rule: {
          name: 'Netflix',
          cost: 49,
          interval: 'monthly',
          category: 'Rozrywka',
          paymentMethod: 'Karta',
        },
        days: ['2026-09-12', '2026-10-12'],
      },
    };

    const days = diffRows(n).find((r) => r.label === 'Naliczone dni');

    expect(days?.after).toBe('12.09.2026, 12.10.2026');
  });

  it('has no change rows for the unfinished tasks summary', () => {
    const n: Notification = {
      ...base,
      kind: 'time-day-unfinished',
      payload: {
        day: '2026-10-20',
        tasks: [
          { title: 'Raport', at: '09:00' },
          { title: 'Zakupy', at: null },
        ],
      },
    };

    expect(diffRows(n)).toEqual([]);
  });
});

describe('inline text diff', () => {
  it('marks the replaced word and keeps the rest', () => {
    expect(diffText('Kawa u Ani', 'Kawa u Basi')).toEqual([
      { kind: 'same', text: 'Kawa u ' },
      { kind: 'removed', text: 'Ani' },
      { kind: 'added', text: 'Basi' },
    ]);
  });

  it('returns one unchanged segment for equal text', () => {
    expect(diffText('abc', 'abc')).toEqual([{ kind: 'same', text: 'abc' }]);
  });
});
