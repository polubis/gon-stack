import { RECEIPT_MAX_BYTES } from '@schemas/receipts';
import type { Category, CategoryId } from '../domain/models';

export const FEATURE_NAME = 'ExpensesManagement';

/** Placeholder category id while the user has no categories. */
export const NO_CATEGORY = '' as CategoryId;

/** Shown for products when the user has no categories. */
export const UNCATEGORIZED: Category = {
  id: NO_CATEGORY,
  name: 'Bez kategorii',
  icon: 'sparkles',
  color: '#4b5a52',
};

export const DEFAULT_PRODUCT_NAME = 'Nowy produkt';

/** Largest receipt photo the server accepts. */
export const MAX_RECEIPT_BYTES = RECEIPT_MAX_BYTES;

/** Receipt photos are shrunk before upload; small text stays readable at this size. */
export const RECEIPT_UPLOAD = { maxEdge: 1600, quality: 0.8 } as const;

/** Query param holding the expense type tab. */
export const KIND_PARAM = 'type';

export const ERROR_CODES = {
  load: 'EXPENSES_MANAGEMENT_LOAD',
  render: 'EXPENSES_MANAGEMENT_RENDER',
  scan: 'RECEIPT_SCAN',
} as const;

export const RECEIPT_FILE_ERRORS = {
  notImage: 'Wybierz plik ze zdjęciem paragonu.',
  tooLarge: 'Zdjęcie jest za duże. Maksymalny rozmiar to 10 MB.',
} as const;

export const NOTICES = {
  expenseFailed: {
    title: 'Nie udało się dodać wydatku',
    code: 'EXPENSE_CREATE_FAILED',
  },
  recurringFailed: {
    title: 'Nie udało się dodać wydatku cyklicznego',
    code: 'RECURRING_CREATE_FAILED',
  },
} as const;
