import { describe, expect, it } from 'vitest';
import {
  groupByMonth,
  sortByDateDesc,
  sumAmount,
} from '../presentation/selectors';
import type { CategoryId, Expense, ExpenseId } from '../domain/models';

const expense = (id: string, date: string, amount: number): Expense => ({
  id: id as ExpenseId,
  merchant: id,
  date,
  amount,
  categoryId: 'c-1' as CategoryId,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  items: [],
});

describe('expenses grouping', () => {
  const list = [
    expense('a', '2025-03-10T10:00:00Z', 10),
    expense('b', '2025-04-02T10:00:00Z', 20),
    expense('c', '2025-04-20T10:00:00Z', 5),
  ];

  it('sorts newest first without mutating the input', () => {
    expect(sortByDateDesc(list).map((e) => e.id)).toEqual(['c', 'b', 'a']);
    expect(list.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('groups by month, newest month first', () => {
    const groups = groupByMonth(list);

    expect(groups.map(([month]) => month)).toEqual(['2025-04', '2025-03']);
    expect(groups[0]![1].map((e) => e.id)).toEqual(['b', 'c']);
  });

  it('sums amounts, zero for an empty list', () => {
    expect(sumAmount(list)).toBe(35);
    expect(sumAmount([])).toBe(0);
  });
});
