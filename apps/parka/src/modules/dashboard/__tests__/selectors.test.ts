import { describe, expect, it } from 'vitest';
import {
  categoryTabs,
  expensesInMonth,
  foldSlices,
  monthOptions,
  niceStep,
  sortByDateDesc,
  sumAmount,
} from '../presentation/selectors';
import { toMonth } from '../domain/format';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
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

describe('dashboard slice folding', () => {
  const slice = (label: string, value: number, isOther = false) => ({
    label,
    value,
    isOther,
  });
  const other = (value: number) => slice('Inne', value, true);

  it('keeps slices as they are when nothing overflows', () => {
    const slices = [slice('A', 3), slice('B', 5)];

    expect(foldSlices(slices, 3, other)).toEqual(slices);
  });

  it('folds the smallest slices into a trailing other slice', () => {
    const folded = foldSlices(
      [slice('A', 1), slice('B', 5), slice('C', 3), slice('D', 2)],
      2,
      other,
    );

    expect(folded.map((s) => [s.label, s.value])).toEqual([
      ['B', 5],
      ['C', 3],
      ['Inne', 3],
    ]);
  });

  it('merges an existing other slice, whatever its label', () => {
    const folded = foldSlices(
      [slice('A', 4), slice('Misc', 6, true), slice('B', 1), slice('C', 2)],
      2,
      other,
    );

    expect(folded.map((s) => [s.label, s.value])).toEqual([
      ['A', 4],
      ['C', 2],
      ['Inne', 7],
    ]);
  });

  it('keeps an existing other slice last even without overflow', () => {
    const folded = foldSlices(
      [slice('Misc', 6, true), slice('A', 4)],
      3,
      other,
    );

    expect(folded.map((s) => s.value)).toEqual([4, 6]);
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
