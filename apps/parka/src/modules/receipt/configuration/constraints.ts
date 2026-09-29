import type { Category, CategoryId } from '../domain/models';

export const FEATURE_NAME = 'Receipt';

/** Placeholder category id while the user has no categories. */
export const NO_CATEGORY = '' as CategoryId;

/** Shown for items when the user has no categories. */
export const UNCATEGORIZED: Category = {
  id: NO_CATEGORY,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: '#4b5a52',
};

export const DEFAULT_ITEM_NAME = 'Nowy produkt';

export const NOTIFICATION_TITLE = 'Nowy paragon';

export const PAYMENT_METHOD = 'Karta **** 4213';

/** Fake "scanner" latency before the empty draft appears. */
export const CAPTURE_DELAY_MS = 600;

export const ERROR_CODES = {
  load: 'RECEIPT_LOAD',
  save: 'RECEIPT_SAVE',
  render: 'RECEIPT_RENDER',
} as const;
