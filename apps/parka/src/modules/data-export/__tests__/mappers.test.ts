import { describe, expect, it } from 'vitest';
import {
  toCategory,
  toExpense,
  type CategoryDto,
  type ExpenseDto,
} from '../integration/mappers';

describe('data export mappers', () => {
  it('keeps only export fields of an expense', () => {
    const dto = {
      id: 'e-1',
      merchant: 'Shop',
      date: '2025-04-09T12:00:00.000Z',
      amount: 12.5,
      categoryId: 'c-1',
      paymentMethod: 'card',
      isBill: true,
    } as unknown as ExpenseDto;

    expect(toExpense(dto)).toEqual({
      id: 'e-1',
      merchant: 'Shop',
      date: '2025-04-09T12:00:00.000Z',
      amount: 12.5,
      categoryId: 'c-1',
      paymentMethod: 'card',
    });
  });

  it('keeps null category of a mixed expense', () => {
    const dto = { id: 'e-2', categoryId: null } as unknown as ExpenseDto;

    expect(toExpense(dto).categoryId).toBeNull();
  });

  it('keeps only id and name of a category', () => {
    const dto = {
      id: 'c-1',
      name: 'Food',
      color: 'red',
    } as unknown as CategoryDto;

    expect(toCategory(dto)).toEqual({ id: 'c-1', name: 'Food' });
  });
});
