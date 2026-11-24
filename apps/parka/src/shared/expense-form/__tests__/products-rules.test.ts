import { describe, expect, it } from 'vitest';
import {
  createProduct,
  defaultCategoryId,
  expenseCategoryId,
  NO_CATEGORY,
  patchProduct,
  productsFromDraft,
  resolveCategory,
  UNCATEGORIZED,
} from '../domain/products';
import type { Category, CategoryId } from '../domain/models';

const FOOD = 'c-food' as CategoryId;
const HOME = 'c-home' as CategoryId;

const category = (id: CategoryId, name: string): Category => ({
  id,
  name,
  icon: 'sparkles',
  color: '#000000',
});

const CATEGORIES = [category(FOOD, 'Jedzenie'), category(HOME, 'Dom')];

describe('new product', () => {
  it('starts free, single and undiscounted in the given category', () => {
    const product = createProduct(FOOD, 'Chleb');

    expect(product).toMatchObject({
      name: 'Chleb',
      unitPrice: 0,
      quantity: 1,
      discount: 0,
      categoryId: FOOD,
    });
  });

  it('gets a unique id each time', () => {
    expect(createProduct(FOOD, 'A').id).not.toBe(createProduct(FOOD, 'A').id);
  });
});

describe('product patch', () => {
  it('changes only the matching product', () => {
    const bread = createProduct(FOOD, 'Chleb');
    const milk = createProduct(FOOD, 'Mleko');

    const result = patchProduct([bread, milk], milk.id, { unitPrice: 4 });

    expect(result[0]).toBe(bread);
    expect(result[1]).toMatchObject({ name: 'Mleko', unitPrice: 4 });
  });

  it('leaves the list as is for an unknown id', () => {
    const bread = createProduct(FOOD, 'Chleb');

    const result = patchProduct([bread], 'item-none' as never, { discount: 1 });

    expect(result).toEqual([bread]);
  });
});

describe('expense category', () => {
  it('is the one the products share', () => {
    const items = [
      createProduct(HOME, 'Lampa'),
      createProduct(HOME, 'Zarowka'),
    ];

    expect(expenseCategoryId(items, FOOD)).toBe(HOME);
  });

  it('is empty when products differ', () => {
    const items = [createProduct(HOME, 'Lampa'), createProduct(FOOD, 'Chleb')];

    expect(expenseCategoryId(items, HOME)).toBeNull();
  });

  it('keeps the manual choice without products', () => {
    expect(expenseCategoryId([], FOOD)).toBe(FOOD);
    expect(expenseCategoryId([], undefined)).toBeNull();
  });
});

describe('default category', () => {
  it('is the first one the user owns', () => {
    expect(defaultCategoryId(CATEGORIES)).toBe(FOOD);
  });

  it('is a placeholder without categories', () => {
    expect(defaultCategoryId([])).toBe(NO_CATEGORY);
  });
});

describe('category resolving', () => {
  it('finds the matching category', () => {
    expect(resolveCategory(CATEGORIES, HOME).name).toBe('Dom');
  });

  it('falls back to the first category for an unknown id', () => {
    expect(resolveCategory(CATEGORIES, 'c-gone' as CategoryId).id).toBe(FOOD);
  });

  it('falls back to the uncategorized placeholder without categories', () => {
    expect(resolveCategory([], FOOD)).toBe(UNCATEGORIZED);
  });
});

describe('products from a scanned draft', () => {
  const draft = (categoryId: CategoryId | null) => ({
    name: 'Ser',
    unitPrice: 5,
    quantity: 2,
    discount: 1,
    categoryId,
  });

  it('keeps an owned category and the item values', () => {
    const [product] = productsFromDraft([draft(HOME)], CATEGORIES);

    expect(product).toMatchObject({
      name: 'Ser',
      unitPrice: 5,
      quantity: 2,
      discount: 1,
      categoryId: HOME,
    });
  });

  it('moves a foreign or missing category to the first one', () => {
    const result = productsFromDraft(
      [draft('c-foreign' as CategoryId), draft(null)],
      CATEGORIES,
    );

    expect(result.map((p) => p.categoryId)).toEqual([FOOD, FOOD]);
  });

  it('gives each item its own id', () => {
    const [a, b] = productsFromDraft([draft(FOOD), draft(FOOD)], CATEGORIES);

    expect(a.id).not.toBe(b.id);
  });
});
