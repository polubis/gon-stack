import { describe, expect, it } from 'vitest';
import { toCategory, toRecurring } from '../integration/mappers';
import { filterByTab, resolveCategory } from '../presentation/selectors';

const item = (id: string, active: boolean) =>
  toRecurring({
    id,
    name: id,
    cost: 1,
    nextPaymentDate: '2025-05-01T00:00:00Z',
    active,
    paymentMethod: 'card',
    categoryId: 'c-1',
    history: [],
  });

describe('recurring domain', () => {
  it('shows only active items on the active tab', () => {
    const list = [item('a', true), item('b', false)];

    expect(filterByTab(list, 'active').map((r) => r.id)).toEqual(['a']);
    expect(filterByTab(list, 'all')).toHaveLength(2);
  });

  it('falls back to the first category, then a placeholder', () => {
    const food = toCategory({
      id: 'c-1',
      name: 'Food',
      icon: 'cart',
      color: '#fff',
    });

    expect(resolveCategory([food], item('a', true).categoryId)).toBe(food);
    expect(resolveCategory([food], 'other' as typeof food.id)).toBe(food);
    expect(resolveCategory([], 'x' as typeof food.id).name).toBe(
      'Bez kategorii',
    );
  });
});
