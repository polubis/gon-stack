import { describe, expect, it } from 'vitest';
import {
  categoryProgress,
  categoryTabs,
  expensesInMonth,
  limitTone,
  monthOptions,
  niceStep,
  sortByDateDesc,
  sumAmount,
  totalProgress,
  withoutLimit,
} from '../presentation/selectors';
import { toMonth } from '../domain/format';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Month,
} from '../domain/models';

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

describe('dashboard selectors', () => {
  const list = [
    expense('a', '2025-03-10T10:00:00Z', 10),
    expense('b', '2025-04-02T10:00:00Z', 20),
    expense('c', '2025-04-20T10:00:00Z', 5),
  ];

  it('sorts newest first without mutating the input', () => {
    expect(sortByDateDesc(list).map((e) => e.id)).toEqual(['c', 'b', 'a']);
    expect(list.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('keeps only the chosen month, newest first', () => {
    expect(expensesInMonth(list, '2025-04' as Month).map((e) => e.id)).toEqual([
      'c',
      'b',
    ]);
  });

  it('lists used categories, biggest spend first', () => {
    const categories = [
      { id: 'c-1', name: 'A', icon: 'cart', color: 'x' },
      { id: 'c-2', name: 'B', icon: 'cart', color: 'y' },
    ] as Category[];
    const mixed = [
      {
        ...expense('a', '2025-04-01T10:00:00Z', 10),
        categoryId: 'c-2' as CategoryId,
      },
      {
        ...expense('b', '2025-04-02T10:00:00Z', 20),
        categoryId: 'c-1' as CategoryId,
      },
      {
        ...expense('c', '2025-04-03T10:00:00Z', 5),
        categoryId: 'c-2' as CategoryId,
      },
    ];

    expect(
      categoryTabs(mixed, categories).map((t) => [t.category.id, t.count]),
    ).toEqual([
      ['c-1', 1],
      ['c-2', 2],
    ]);
  });

  it('sums amounts, zero for an empty list', () => {
    expect(sumAmount(list)).toBe(35);
    expect(sumAmount([])).toBe(0);
  });
});

describe('dashboard month options', () => {
  const month = (value: string) => toMonth(value);

  it('lists the window newest first, crossing year boundaries', () => {
    expect(monthOptions(month('2026-01'), month('2026-02'), 3)).toEqual([
      '2026-02',
      '2026-01',
      '2025-12',
    ]);
  });

  it('prepends a selected month older than the window', () => {
    expect(monthOptions(month('2024-05'), month('2026-02'), 2)).toEqual([
      '2024-05',
      '2026-02',
      '2026-01',
    ]);
  });
});

describe('dashboard chart axis step', () => {
  it.each([
    [0, 0.5],
    [1, 0.5],
    [7, 2],
    [999, 500],
  ])('fits %s on four rows with step %s', (max, step) => {
    expect(niceStep(max, 4)).toBe(step);
  });
});

describe('dashboard limit progress', () => {
  const MONTH = '2025-04' as Month;
  const FOOD = 'c-food' as CategoryId;
  const OTHER = 'c-other' as CategoryId;

  const spend = (id: string, date: string, amount: number, c = FOOD) => ({
    ...expense(id, date, amount),
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
    spend('e-1', '2025-04-02T10:00:00Z', 50),
    spend('e-2', '2025-04-20T10:00:00Z', 150, OTHER),
    spend('e-3', '2025-03-30T10:00:00Z', 900),
  ];

  it('counts only expenses from the chosen month toward the total limit', () => {
    expect(totalProgress([TOTAL], EXPENSES, MONTH)).toEqual({
      spent: 200,
      amount: 1000,
      pct: 20,
    });
  });

  it('has no total progress without a total limit', () => {
    expect(totalProgress([FOOD_LIMIT], EXPENSES, MONTH)).toBeNull();
  });

  it('counts only the limited category toward a category limit', () => {
    const [progress] = categoryProgress([TOTAL, FOOD_LIMIT], EXPENSES, MONTH);

    expect(progress).toMatchObject({
      id: 'l-2',
      categoryId: FOOD,
      spent: 50,
      pct: 50,
    });
  });

  it('counts the product share of a multi-category expense toward a limit', () => {
    const mixed: Expense = {
      ...EXPENSES[0]!,
      id: 'mixed' as ExpenseId,
      amount: 30,
      categoryId: null,
      items: [
        {
          id: 'i-1',
          name: 'a',
          unitPrice: 10,
          quantity: 1,
          discount: 0,
          categoryId: FOOD,
        },
        {
          id: 'i-2',
          name: 'b',
          unitPrice: 20,
          quantity: 1,
          discount: 0,
          categoryId: OTHER,
        },
      ] as Expense['items'],
    };
    const [progress] = categoryProgress([FOOD_LIMIT], [mixed], MONTH);

    expect(progress).toMatchObject({ categoryId: FOOD, spent: 10 });
  });

  it('warns at 80 percent and turns dangerous at 100', () => {
    expect([limitTone(79), limitTone(80), limitTone(100)]).toEqual([
      'brand',
      'warn',
      'danger',
    ]);
  });

  it('offers only categories that have no limit yet', () => {
    const categories = [
      { id: FOOD, name: 'a', icon: 'cart' as const, color: '#000' },
      { id: OTHER, name: 'b', icon: 'car' as const, color: '#000' },
    ];

    expect(withoutLimit(categories, [FOOD_LIMIT]).map((c) => c.id)).toEqual([
      OTHER,
    ]);
  });
});
