import { describe, expect, it } from 'vitest';
import { toGoal, toLimit } from '../integration/mappers';

describe('limit mapper', () => {
  it('maps a category limit with its category', () => {
    const limit = toLimit({
      id: 'l-1',
      scope: 'category',
      categoryId: 'c-1',
      amount: 10,
      alertAt80: true,
      delivery: 'push',
    });

    expect(limit).toMatchObject({ scope: 'category', categoryId: 'c-1' });
  });

  it('maps a total limit without a category', () => {
    const limit = toLimit({
      id: 'l-1',
      scope: 'total',
      amount: 10,
      alertAt80: false,
      delivery: 'email',
    });

    expect(limit).not.toHaveProperty('categoryId');
  });

  it('maps a goal as is', () => {
    const goal = toGoal({
      id: 'g-1',
      name: 'Trip',
      target: 5,
      saved: 1,
      months: 3,
    });

    expect(goal).toEqual({
      id: 'g-1',
      name: 'Trip',
      target: 5,
      saved: 1,
      months: 3,
    });
  });
});
