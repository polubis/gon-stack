import { describe, expect, it } from 'vitest';
import { occurrencesInMonth, type RecurringSource } from '../occurrences';

const item = (over: Partial<RecurringSource> = {}): RecurringSource => ({
  id: 'r-1',
  name: 'Netflix',
  cost: 30,
  nextPaymentDate: '2025-05-15T00:00:00Z',
  active: true,
  categoryId: 'c-1',
  history: [],
  ...over,
});

describe('recurring occurrences', () => {
  it('charges every month from the first payment on', () => {
    const list = [item()];

    expect(occurrencesInMonth(list, '2025-04')).toEqual([]);
    expect(occurrencesInMonth(list, '2025-05')[0]).toMatchObject({
      date: '2025-05-15',
      amount: 30,
    });
    expect(occurrencesInMonth(list, '2026-01')).toHaveLength(1);
  });

  it('starts at the oldest payment in the history', () => {
    const list = [item({ history: [{ date: '2025-03-15T00:00:00Z' }] })];

    expect(occurrencesInMonth(list, '2025-02')).toEqual([]);
    expect(occurrencesInMonth(list, '2025-03')).toHaveLength(1);
  });

  it('skips paused items', () => {
    expect(occurrencesInMonth([item({ active: false })], '2025-06')).toEqual(
      [],
    );
  });

  it('keeps a late-month day within shorter months', () => {
    const list = [item({ nextPaymentDate: '2025-01-31T00:00:00Z' })];

    expect(occurrencesInMonth(list, '2025-02')[0]?.date).toBe('2025-02-28');
    expect(occurrencesInMonth(list, '2025-03')[0]?.date).toBe('2025-03-31');
  });
});
