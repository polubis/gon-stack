import { describe, expect, it } from 'vitest';
import type {
  CategoryId,
  ExpenseId,
  NewExpense,
  NewRecurring,
  ProductId,
  RecurringId,
  StoredExpense,
} from '../domain/models';
import {
  toCategory,
  toExpenseBody,
  toReceiptDraft,
  toRecurringBody,
  toStoredExpense,
} from '../integration/mappers';

const FOOD = 'c-1' as CategoryId;

const product = {
  id: 'p-1' as ProductId,
  name: 'Milk',
  unitPrice: 4,
  quantity: 2,
  discount: 1,
  categoryId: FOOD,
};

const expense: NewExpense = {
  id: 'e-1' as ExpenseId,
  merchant: 'Shop',
  date: '2026-11-15T10:00:00.000Z',
  amount: 7,
  categoryId: FOOD,
  paymentMethod: 'card',
  isBill: false,
  source: 'manual',
  device: null,
  items: [product],
};

describe('category from server', () => {
  it('keeps name, icon and color', () => {
    expect(
      toCategory({ id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' }),
    ).toEqual({ id: 'c-1', name: 'Food', icon: 'cart', color: '#0f7a4f' });
  });
});

describe('receipt draft from scan', () => {
  const dto = (category: object) =>
    ({
      merchant: 'Shop',
      date: '2026-11-15T10:00:00.000Z',
      amount: 7,
      paymentMethod: null,
      items: [
        { name: 'Milk', unitPrice: 4, quantity: 2, discount: 1, category },
      ],
    }) as Parameters<typeof toReceiptDraft>[0];

  it('takes the category the scan matched', () => {
    const draft = toReceiptDraft(
      dto({ status: 'assigned', categoryId: 'c-1' }),
    );

    expect(draft.items[0]?.categoryId).toBe('c-1');
  });

  it('leaves the category empty when no own category fits', () => {
    const draft = toReceiptDraft(dto({ status: 'unassigned' }));

    expect(draft.items[0]?.categoryId).toBeNull();
    expect(draft.paymentMethod).toBeNull();
  });
});

describe('stored expense from server', () => {
  const dto = (extra: object) =>
    ({ ...expense, ...extra }) as unknown as Parameters<
      typeof toStoredExpense
    >[0];

  it('keeps the rule link of an expense a rule made', () => {
    const stored = toStoredExpense(
      dto({ recurringId: 'r-1', occurrenceDate: '2026-11-01' }),
    );

    expect(stored.recurringId).toBe('r-1');
    expect(stored.occurrenceDate).toBe('2026-11-01');
  });

  it('shows an ordinary expense as not made by any rule', () => {
    const stored = toStoredExpense(dto({}));

    expect(stored.recurringId).toBeNull();
    expect(stored.occurrenceDate).toBeNull();
  });

  it('keeps products', () => {
    expect(toStoredExpense(dto({})).items).toEqual([product]);
  });
});

describe('expense body for server', () => {
  it('sends a new expense with no rule link', () => {
    const body = toExpenseBody(expense);

    expect(body.recurringId).toBeNull();
    expect(body.occurrenceDate).toBeNull();
    expect(body.items).toEqual([product]);
  });

  it('keeps the rule link of a stored expense', () => {
    const stored: StoredExpense = {
      ...expense,
      recurringId: 'r-1' as RecurringId,
      occurrenceDate: '2026-11-01',
    };

    const body = toExpenseBody(stored);

    expect(body.recurringId).toBe('r-1');
    expect(body.occurrenceDate).toBe('2026-11-01');
  });
});

describe('recurring body for server', () => {
  const recurring: NewRecurring = {
    id: 'r-1' as RecurringId,
    name: 'Rent',
    cost: 7,
    interval: 'monthly',
    startDate: '2026-11-01',
    endDate: null,
    active: true,
    paymentMethod: 'card',
    categoryId: FOOD,
    items: [product],
  };

  it('starts with nothing made yet', () => {
    expect(toRecurringBody(recurring).lastMaterializedDate).toBeNull();
  });

  it('keeps the rule schedule and products', () => {
    const body = toRecurringBody(recurring);

    expect(body).toMatchObject({
      name: 'Rent',
      interval: 'monthly',
      startDate: '2026-11-01',
      endDate: null,
    });
    expect(body.items).toEqual([product]);
  });
});
