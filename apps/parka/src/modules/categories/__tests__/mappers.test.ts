import { describe, expect, it } from 'vitest';
import { toCategory } from '../integration/mappers';

describe('categories mappers', () => {
  it('maps a category DTO', () => {
    expect(
      toCategory({ id: 'c-1', name: 'Food', icon: 'cart', color: '#fff' }),
    ).toEqual({ id: 'c-1', name: 'Food', icon: 'cart', color: '#fff' });
  });

  it('falls back to a known icon for an unknown one', () => {
    expect(
      toCategory({ id: 'c-1', name: 'Food', icon: 'rocket', color: '#fff' })
        .icon,
    ).toBe('sparkles');
  });
});
