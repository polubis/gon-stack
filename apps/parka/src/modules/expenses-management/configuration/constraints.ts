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
  scan: 'Nie udało się przetworzyć zdjęcia. Spróbuj ponownie.',
} as const;

export const NOTICES = {
  expenseFailed: 'Nie udało się dodać wydatku.',
  recurringFailed: 'Nie udało się dodać wydatku cyklicznego.',
} as const;
