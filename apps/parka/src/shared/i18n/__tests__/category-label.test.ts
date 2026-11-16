import { describe, expect, it } from 'vitest';
import { categoryLabel, MIXED_CATEGORY_LABEL } from '../category-label';

describe('categoryLabel', () => {
  it('translates default category symbols', () => {
    expect(categoryLabel('category.groceries')).toBe('Spożywcze');
    expect(categoryLabel('category.bills')).toBe('Rachunki');
    expect(categoryLabel('category.other')).toBe('Inne');
  });

  it('keeps a user made name as it is', () => {
    expect(categoryLabel('Podróże')).toBe('Podróże');
  });

  it('does not translate an unknown symbol', () => {
    expect(categoryLabel('category.unknown')).toBe('category.unknown');
  });

  it('names a mix of categories', () => {
    expect(MIXED_CATEGORY_LABEL).toBe('Wiele kategorii');
  });
});
