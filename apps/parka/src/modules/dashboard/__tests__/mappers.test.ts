import { describe, expect, it } from 'vitest';
import { toCategory, toExpense, toLimit } from '../integration/mappers';

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
      device: {
        id: 'device-1',
        name: 'Chrome on Windows',
        type: 'desktop',
        avatar: null,
        model: null,
        os: null,
        browser: null,
        screen: null,
        customName: null,
        photo: null,
      },
      recurringId: null,
      occurrenceDate: null,
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
    expect(expense.device).toEqual({
      id: 'device-1',
      name: 'Chrome on Windows',
      avatar: null,
      type: 'desktop',
      model: null,
      os: null,
      browser: null,
      screen: null,
      customName: null,
      photo: null,
    });
    expect(expense.items).toHaveLength(1);
    expect(expense.items[0]!.name).toBe('Milk');
  });

  it('keeps the rule an expense was charged from', () => {
    const expense = toExpense({
      id: 'r-1:2025-05-15',
      merchant: 'Netflix',
      date: '2025-05-15T12:00:00.000Z',
      amount: 30,
      categoryId: 'c-1',
      paymentMethod: '',
      isBill: true,
      source: 'manual',
      device: null,
      recurringId: 'r-1',
      occurrenceDate: '2025-05-15',
      items: [],
    });

    expect(expense.recurringId).toBe('r-1');
    expect(expense.occurrenceDate).toBe('2025-05-15');
  });

  it('maps a category DTO', () => {
    expect(
      toCategory({ id: 'c-1', name: 'Food', icon: 'cart', color: '#fff' }),
    ).toEqual({ id: 'c-1', name: 'Food', icon: 'cart', color: '#fff' });
  });
});

describe('dashboard limit mappers', () => {
  it('maps a category limit with its category', () => {
    const limit = toLimit({
      id: 'l-1',
      scope: 'category',
      categoryId: 'c-1',
      amount: 10,
      alertAt: 80,
    });

    expect(limit).toMatchObject({ scope: 'category', categoryId: 'c-1' });
  });

  it('maps a total limit without a category', () => {
    const limit = toLimit({
      id: 'l-1',
      scope: 'total',
      amount: 10,
      alertAt: 80,
    });

    expect(limit).not.toHaveProperty('categoryId');
  });
});
