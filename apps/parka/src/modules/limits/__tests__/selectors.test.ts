import { describe, expect, it } from 'vitest';
import type {
  CategoryId,
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Month,
} from '../domain/models';
import {
  categoryProgress,
  tone,
  totalProgress,
  withoutLimit,
} from '../presentation/selectors';

const MONTH = '2025-04' as Month;
const FOOD = 'c-food' as CategoryId;

const expense = (
  id: string,
  date: string,
  amount: number,
  c = FOOD,
): Expense => ({
  id: id as ExpenseId,
  date,
  amount,
  categoryId: c,
});

const TOTAL: Limit = {
  id: 'l-1' as LimitId,
  scope: 'total',
  amount: 1000,
  alertAt80: true,
  delivery: 'push',
};
const FOOD_LIMIT: Limit = {
  id: 'l-2' as LimitId,
  scope: 'category',
  categoryId: FOOD,
  amount: 100,
  alertAt80: false,
  delivery: 'email',
};

const EXPENSES = [
  expense('e-1', '2025-04-02T10:00:00Z', 50),
  expense('e-2', '2025-04-20T10:00:00Z', 150, 'c-other' as CategoryId),
  expense('e-3', '2025-03-30T10:00:00Z', 900),
];

describe('limit progress', () => {
  it('counts only expenses from the chosen month toward the total limit', () => {
    const progress = totalProgress([TOTAL], EXPENSES, MONTH);

    expect(progress).toEqual({ spent: 200, amount: 1000, pct: 20 });
  });

  it('has no total progress without a total limit', () => {
    expect(totalProgress([FOOD_LIMIT], EXPENSES, MONTH)).toBeNull();
  });

  it('counts only the limited category toward a category limit', () => {
    const [progress] = categoryProgress([TOTAL, FOOD_LIMIT], EXPENSES, MONTH);

    expect(progress).toMatchObject({ categoryId: FOOD, spent: 50, pct: 50 });
  });

  it('warns at 80 percent and turns dangerous at 100', () => {
    expect([tone(79), tone(80), tone(100)]).toEqual([
      'brand',
      'warn',
      'danger',
    ]);
  });

  it('offers only categories that have no limit yet', () => {
    const categories = [
      { id: FOOD, name: 'a', icon: 'cart' as const, color: '#000' },
      {
        id: 'c-other' as CategoryId,
        name: 'b',
        icon: 'car' as const,
        color: '#000',
      },
    ];

    expect(withoutLimit(categories, [FOOD_LIMIT]).map((c) => c.id)).toEqual([
      'c-other',
    ]);
  });
});
