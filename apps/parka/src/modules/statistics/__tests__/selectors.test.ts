import { describe, expect, it } from 'vitest';
import {
  biggestChanges,
  categoryBreakdown,
  changeVsPrevMonth,
  monthTotal,
} from '../presentation/selectors';
import { monthsEndingAt, toMonth } from '../domain/format';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
} from '../domain/models';

const FOOD = { id: 'c-1' as CategoryId, name: 'Jedzenie', color: 'green' };
const CAR = { id: 'c-2' as CategoryId, name: 'Auto', color: 'blue' };
const CATEGORIES: Category[] = [FOOD, CAR];

const expense = (
  date: string,
  amount: number,
  category: Category,
): Expense => ({
  id: `${date}-${amount}` as ExpenseId,
  date,
  amount,
  categoryId: category.id,
});

const APRIL = toMonth('2025-04');

describe('statistics selectors', () => {
  it('sums only the expenses of the chosen month', () => {
    const expenses = [
      expense('2025-04-02T10:00:00Z', 10, FOOD),
      expense('2025-04-20T10:00:00Z', 5, CAR),
      expense('2025-03-20T10:00:00Z', 99, CAR),
    ];

    expect(monthTotal(expenses, APRIL)).toBe(15);
  });

  it('reports zero change when the previous month is empty', () => {
    const expenses = [expense('2025-04-02T10:00:00Z', 10, FOOD)];

    expect(changeVsPrevMonth(expenses, APRIL)).toBe(0);
  });

  it('reports percent change against the previous month', () => {
    const expenses = [
      expense('2025-03-02T10:00:00Z', 100, FOOD),
      expense('2025-04-02T10:00:00Z', 150, FOOD),
    ];

    expect(changeVsPrevMonth(expenses, APRIL)).toBe(50);
  });

  it('lists categories biggest first and skips unused ones', () => {
    const expenses = [
      expense('2025-04-02T10:00:00Z', 10, FOOD),
      expense('2025-04-03T10:00:00Z', 30, CAR),
    ];

    const slices = categoryBreakdown(expenses, CATEGORIES, [APRIL]);

    expect(slices.map((s) => s.category.name)).toEqual(['Auto', 'Jedzenie']);
    expect(slices[0]?.pct).toBe(75);
  });

  it('keeps only significant category changes', () => {
    const expenses = [
      expense('2025-03-02T10:00:00Z', 100, FOOD),
      expense('2025-04-02T10:00:00Z', 200, FOOD),
      expense('2025-03-02T10:00:00Z', 100, CAR),
      expense('2025-04-02T10:00:00Z', 100, CAR),
    ];

    const changes = biggestChanges(expenses, CATEGORIES, APRIL);

    expect(changes).toEqual([{ category: FOOD, changePct: 100 }]);
  });

  it('builds trailing months across a year boundary, oldest first', () => {
    expect(monthsEndingAt(toMonth('2025-02'), 3)).toEqual([
      '2024-12',
      '2025-01',
      '2025-02',
    ]);
  });
});
