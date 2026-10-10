import { describe, expect, it } from 'vitest';
import {
  buildCsv,
  expensesForMonth,
  summarize,
} from '../presentation/selectors';
import { toMonth } from '../domain/format';
import type {
  CategoryId,
  Expense,
  ExpenseId,
  Recurring,
  RecurringId,
} from '../domain/models';

const expense = (
  date: string,
  amount: number,
  categoryId: string,
  isBill = false,
): Expense => ({
  id: `${date}-${amount}` as ExpenseId,
  merchant: 'Shop',
  date,
  amount,
  categoryId: categoryId as CategoryId,
  categoryIds: [categoryId as CategoryId],
  isBill,
});

const APRIL = toMonth('2025-04');

describe('report selectors', () => {
  it('keeps only the month expenses, newest first', () => {
    const expenses = [
      expense('2025-04-02T10:00:00Z', 1, 'c-1'),
      expense('2025-03-02T10:00:00Z', 2, 'c-1'),
      expense('2025-04-20T10:00:00Z', 3, 'c-1'),
    ];

    expect(expensesForMonth(expenses, APRIL).map((e) => e.amount)).toEqual([
      3, 1,
    ]);
  });

  it('counts every category a multi-category expense touches', () => {
    const mixed: Expense = {
      ...expense('2025-04-05T10:00:00Z', 9, 'c-1'),
      categoryId: null,
      categoryIds: ['c-1', 'c-3'] as CategoryId[],
    };

    expect(
      summarize([mixed, expense('2025-04-06T10:00:00Z', 1, 'c-2')], []),
    ).toMatchObject({ categoryCount: 3 });
  });

  it('counts distinct categories and active recurring payments', () => {
    const recurring: Recurring[] = [
      { id: 'r-1' as RecurringId, active: true },
      { id: 'r-2' as RecurringId, active: false },
    ];

    const summary = summarize(
      [
        expense('2025-04-02T10:00:00Z', 10, 'c-1'),
        expense('2025-04-03T10:00:00Z', 5, 'c-1'),
        expense('2025-04-04T10:00:00Z', 5, 'c-2'),
      ],
      recurring,
    );

    expect(summary).toEqual({
      total: 20,
      categoryCount: 2,
      recurringCount: 1,
    });
  });

  it('writes a semicolon CSV with a header and typed rows (blank category when unknown)', () => {
    const csv = buildCsv(
      [expense('2025-04-02T10:00:00Z', 12.5, 'c-1', true)],
      [],
    );

    expect(csv.split('\n')).toEqual([
      'Data;Sklep;Kategoria;Kwota;Typ',
      '02.04.2025;Shop;;12.50;Rachunek',
    ]);
  });
});
