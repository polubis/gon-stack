import { describe, expect, it } from 'vitest';
import type { Category, CategoryId, Draft } from '../domain/models';
import { addItem, emptyDraft, patchItem, toReceipt } from '../domain/receipt';
import { canSave, draftTotal } from '../presentation/selectors';

const CAT = 'c-1' as CategoryId;
const category: Category = {
  id: CAT,
  name: 'Food',
  icon: 'cart',
  color: '#fff',
};

const draftWith = (merchant: string): Draft => {
  const base = emptyDraft(CAT, 'Item');
  const [item] = base.items;
  return patchItem({ ...base, merchant }, item!.id, {
    unitPrice: 4.5,
    quantity: 2,
    discount: 1,
  });
};

describe('receipt draft', () => {
  it('totals price times quantity minus discount', () => {
    expect(draftTotal(draftWith('Shop'))).toBe(8);
  });

  it('adds an item in the given category', () => {
    const draft = addItem(emptyDraft(CAT, 'Item'), CAT, 'Item');

    expect(draft.items).toHaveLength(2);
    expect(draft.items[1]!.categoryId).toBe(CAT);
  });

  it('cannot be saved without categories', () => {
    expect(canSave(emptyDraft(CAT, 'Item'), [])).toBe(false);
  });

  it('can be saved when categories exist and items are categorized', () => {
    expect(canSave(emptyDraft(CAT, 'Item'), [category])).toBe(true);
  });

  it('builds an expense and a confirmation notification', () => {
    const { expense, notification } = toReceipt(draftWith('Shop'), {
      amount: 8,
      notificationTitle: 'Nowy paragon',
      notificationBody: 'Shop · 8',
      paymentMethod: 'Card',
      fallbackCategoryId: CAT,
    });

    expect(expense.amount).toBe(8);
    expect(expense.source).toBe('receipt');
    expect(expense.categoryId).toBe(CAT);
    expect(expense.id.startsWith('exp-')).toBe(true);
    expect(notification.kind).toBe('receipt-confirmation');
    expect(notification.body).toContain('Shop');
  });
});
