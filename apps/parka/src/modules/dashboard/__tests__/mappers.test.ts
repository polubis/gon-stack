import { describe, expect, it } from 'vitest';
import { toCategory, toExpense, toSummary } from '../integration/mappers';

describe('dashboard expense mappers', () => {
  it('maps an expense DTO with its receipt items', () => {
    const expense = toExpense({
      id: 'e-1',
      merchant: 'Shop',
      date: '2025-04-02T10:00:00Z',
      amount: 12.5,
      categoryId: 'c-1',
      paymentMethod: 'card',
      isBill: true,
      source: 'receipt',
      items: [
        {
          id: 'i-1',
          name: 'Milk',
          unitPrice: 5,
          quantity: 2,
          discount: 0,
          categoryId: 'c-1',
        },
      ],
    });

    expect(expense.id).toBe('e-1');
    expect(expense.isBill).toBe(true);
    expect(expense.items).toHaveLength(1);
    expect(expense.items[0]!.name).toBe('Milk');
  });

  it('maps a category DTO', () => {
    expect(
      toCategory({ id: 'c-1', name: 'Food', icon: 'cart', color: '#fff' }),
    ).toEqual({ id: 'c-1', name: 'Food', icon: 'cart', color: '#fff' });
  });

  it('maps a summary DTO with its new month fields', () => {
    const daily = [{ day: 1, total: 4 }];
    const previousDaily = [{ day: 1, total: 8 }];

    const summary = toSummary({
      userName: 'Anna',
      total: 10,
      change: 25,
      previousTotal: 8,
      transactions: 3,
      dailyAverage: 1.5,
      daily,
      previousDaily,
      monthlyLimit: null,
      categories: [
        { categoryId: 'c-1', name: 'Food', color: 'green', amount: 6, pct: 60 },
      ],
    });

    expect(summary).toEqual({
      userName: 'Anna',
      total: 10,
      change: 25,
      previousTotal: 8,
      transactions: 3,
      dailyAverage: 1.5,
      daily,
      previousDaily,
      monthlyLimit: null,
      categories: [
        { id: 'c-1', name: 'Food', color: 'green', amount: 6, pct: 60 },
      ],
    });
  });
});
