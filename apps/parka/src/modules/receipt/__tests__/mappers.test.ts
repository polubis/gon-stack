import { describe, expect, it } from 'vitest';
import type { ExpenseId, NotificationId } from '../domain/models';
import {
  toCategory,
  toExpenseBody,
  toNotificationBody,
} from '../integration/mappers';

describe('receipt mappers', () => {
  it('maps a category DTO', () => {
    const category = toCategory({
      id: 'c-1',
      name: 'Food',
      icon: 'cart',
      color: '#123456',
    });

    expect([category.id, category.name, category.icon]).toEqual([
      'c-1',
      'Food',
      'cart',
    ]);
  });

  it('builds the expense request body with items', () => {
    const body = toExpenseBody({
      id: 'e-1' as ExpenseId,
      merchant: 'Shop',
      date: '2025-04-02T12:00:00',
      amount: 8,
      categoryId: 'c-1' as never,
      paymentMethod: 'card',
      isBill: false,
      source: 'receipt',
      items: [],
    });

    expect(body).toMatchObject({ id: 'e-1', amount: 8, source: 'receipt' });
  });

  it('builds the notification request body', () => {
    const body = toNotificationBody({
      id: 'n-1' as NotificationId,
      kind: 'receipt-confirmation',
      title: 'Nowy paragon',
      body: 'Shop',
      ageDays: 0,
    });

    expect(body.kind).toBe('receipt-confirmation');
  });
});
