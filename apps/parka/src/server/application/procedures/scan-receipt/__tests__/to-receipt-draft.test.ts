import { describe, expect, it } from 'vitest';
import { toReceiptDraft } from '../to-receipt-draft';

const categories = [
  { id: 'food', name: 'Food' },
  { id: 'fun', name: 'Fun' },
];

const receipt = (
  category: string | null,
  suggestedCategory: string | null,
) => ({
  merchant: 'Biedronka',
  date: '2026-10-07T10:00:00.000Z',
  amount: 9.5,
  paymentMethod: 'Card',
  items: [
    {
      name: 'Bread',
      unitPrice: 5.5,
      quantity: 1,
      discount: 0,
      category,
      suggestedCategory,
    },
  ],
});

describe('receipt draft categories', () => {
  it('assigns a recognised category', () => {
    const draft = toReceiptDraft(receipt('Food', null), categories);

    expect(draft.items[0]?.category).toEqual({
      status: 'assigned',
      categoryId: 'food',
    });
  });

  it('matches category names regardless of case', () => {
    const draft = toReceiptDraft(receipt(' food ', null), categories);

    expect(draft.items[0]?.category.status).toBe('assigned');
  });

  it('marks an unreadable category as unknown with the suggestion', () => {
    const draft = toReceiptDraft(receipt(null, 'Pets'), categories);

    expect(draft.items[0]?.category).toEqual({
      status: 'unknown',
      suggestion: 'Pets',
    });
  });

  it('marks a category outside the user list as unknown', () => {
    const draft = toReceiptDraft(receipt('Travel', null), categories);

    expect(draft.items[0]?.category).toEqual({
      status: 'unknown',
      suggestion: 'Travel',
    });
  });
});
