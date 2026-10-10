import { describe, expect, it } from 'vitest';
import { categoryShares, deriveExpenseCategory } from '../category';

const item = (
  categoryId: string,
  unitPrice = 10,
  quantity = 1,
  discount = 0,
) => ({
  categoryId,
  unitPrice,
  quantity,
  discount,
});

describe('expense category', () => {
  it('keeps the chosen category without products', () => {
    expect(deriveExpenseCategory([], 'food')).toBe('food');
  });

  it('takes the category of a single product', () => {
    expect(deriveExpenseCategory([item('home')], 'food')).toBe('home');
  });

  it('takes the shared category of equal products', () => {
    expect(deriveExpenseCategory([item('home'), item('home')], null)).toBe(
      'home',
    );
  });

  it('has no category for products from different categories', () => {
    expect(deriveExpenseCategory([item('home'), item('food')], 'food')).toBe(
      null,
    );
  });

  it('gives the whole amount to a categorized expense', () => {
    expect(
      categoryShares({ amount: 30, categoryId: 'food', items: [] }),
    ).toEqual([{ categoryId: 'food', amount: 30 }]);
  });

  it('splits a mixed expense by product amounts with discounts', () => {
    expect(
      categoryShares({
        amount: 41,
        categoryId: null,
        items: [item('food', 5, 2), item('home', 20, 1, 4), item('food', 15)],
      }),
    ).toEqual([
      { categoryId: 'food', amount: 25 },
      { categoryId: 'home', amount: 16 },
    ]);
  });
});
