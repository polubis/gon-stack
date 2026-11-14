import { describe, expect, it } from 'vitest';
import { toCategory, toExpense, toRecurring } from '../integration/mappers';

type ExpenseDto = Parameters<typeof toExpense>[0];

const expenseDto = (
  categoryId: string | null,
  itemCategoryIds: string[] = [],
): ExpenseDto =>
  ({
    id: 'e-1',
    merchant: 'Shop',
    date: '2025-04-09T12:00:00.000Z',
    amount: 12.5,
    categoryId,
    isBill: false,
    items: itemCategoryIds.map((id) => ({ categoryId: id })),
  }) as unknown as ExpenseDto;

describe('reports mappers', () => {
  it('maps an expense with its own category', () => {
    expect(toExpense(expenseDto('c-1'))).toEqual({
      id: 'e-1',
      merchant: 'Shop',
      date: '2025-04-09T12:00:00.000Z',
      amount: 12.5,
      categoryId: 'c-1',
      categoryIds: ['c-1'],
      isBill: false,
    });
  });

  it('collects the categories of its products when it has none', () => {
    const expense = toExpense(expenseDto(null, ['c-1', 'c-2']));

    expect(expense.categoryId).toBeNull();
    expect(expense.categoryIds).toEqual(['c-1', 'c-2']);
  });

  it('lists a shared category only once', () => {
    expect(
      toExpense(expenseDto('c-1', ['c-1', 'c-2', 'c-2'])).categoryIds,
    ).toEqual(['c-1', 'c-2']);
  });

  it('keeps an expense without any category uncategorised', () => {
    expect(toExpense(expenseDto(null)).categoryIds).toEqual([]);
  });

  it('maps a category to its id and name only', () => {
    const dto = { id: 'c-1', name: 'Food', icon: 'cart' } as Parameters<
      typeof toCategory
    >[0];

    expect(toCategory(dto)).toEqual({ id: 'c-1', name: 'Food' });
  });

  it('maps a recurring to its id and state only', () => {
    const dto = { id: 'r-1', active: true, name: 'Rent' } as Parameters<
      typeof toRecurring
    >[0];

    expect(toRecurring(dto)).toEqual({ id: 'r-1', active: true });
  });
});
