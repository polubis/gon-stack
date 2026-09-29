import { describe, expect, it } from 'vitest';
import { toFile, toRows } from '../presentation/selectors';
import type {
  Category,
  CategoryId,
  Expense,
  ExpenseId,
} from '../domain/models';

const CATEGORIES: Category[] = [
  { id: 'c-1' as CategoryId, name: 'category.groceries' },
];

const EXPENSES: Expense[] = [
  {
    id: 'e-1' as ExpenseId,
    merchant: 'Shop',
    date: '2025-04-02T10:00:00Z',
    amount: 12.5,
    categoryId: 'c-1' as CategoryId,
    paymentMethod: 'card',
  },
];

describe('data export', () => {
  it('builds a header and a row per expense with a labelled category', () => {
    const rows = toRows(EXPENSES, CATEGORIES);

    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual([
      '02.04.2025',
      'Shop',
      'Spożywcze',
      '12.50',
      'card',
    ]);
  });

  it('joins csv rows with semicolons', () => {
    const file = toFile('csv', [
      ['a', 'b'],
      ['c', 'd'],
    ]);

    expect(file.name).toBe('parka-dane.csv');
    expect(file.content).toBe('a;b\nc;d');
  });

  it('produces a plain-text placeholder for pdf', () => {
    const file = toFile('pdf', [['a', 'b']]);

    expect(file.name).toBe('parka-dane.txt');
    expect(file.content).toContain('a | b');
  });
});
