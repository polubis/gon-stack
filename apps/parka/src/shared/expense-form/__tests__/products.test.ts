import { describe, expect, it } from 'vitest';
import { createProduct, productsTotal } from '../domain/products';
import type { CategoryId } from '../domain/models';

const CATEGORY = 'c-1' as CategoryId;

describe('products total', () => {
  it('is zero without products', () => {
    expect(productsTotal([])).toBe(0);
  });

  it('multiplies price by quantity and subtracts the discount', () => {
    const bread = {
      ...createProduct(CATEGORY, 'Chleb'),
      unitPrice: 3.2,
      quantity: 2,
    };
    const milk = {
      ...createProduct(CATEGORY, 'Mleko'),
      unitPrice: 4,
      discount: 1,
    };

    expect(productsTotal([bread, milk])).toBe(9.4);
  });

  it('does not accumulate floating point noise', () => {
    const cheap = {
      ...createProduct(CATEGORY, 'Gumka'),
      unitPrice: 0.1,
      quantity: 3,
    };

    expect(productsTotal([cheap])).toBe(0.3);
  });
});
