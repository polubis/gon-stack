import { NO_CATEGORY, UNCATEGORIZED } from '../configuration/constraints';
import type {
  Category,
  CategoryId,
  Draft,
  ReceiptItem,
} from '../domain/models';

export const itemTotal = (
  item: Pick<ReceiptItem, 'unitPrice' | 'quantity' | 'discount'>,
): number => item.unitPrice * item.quantity - item.discount;

export const draftTotal = (draft: Draft): number =>
  Number(draft.items.reduce((sum, i) => sum + itemTotal(i), 0).toFixed(2));

/** Matching category, else the first one, else a placeholder. */
export const resolveCategory = (
  categories: Category[],
  id: CategoryId,
): Category =>
  categories.find((c) => c.id === id) ?? categories[0] ?? UNCATEGORIZED;

export const defaultCategoryId = (categories: Category[]): CategoryId =>
  categories[0]?.id ?? NO_CATEGORY;

/** Saving needs at least one category and every item categorized. */
export const canSave = (draft: Draft, categories: Category[]): boolean =>
  categories.length > 0 &&
  draft.items.every((i) => i.categoryId !== NO_CATEGORY);
