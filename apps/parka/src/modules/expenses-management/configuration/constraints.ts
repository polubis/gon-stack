import { RECEIPT_MAX_BYTES } from '@schemas/receipts';

export const FEATURE_NAME = 'ExpensesManagement';

/** Largest receipt photo the server accepts. */
export const MAX_RECEIPT_BYTES = RECEIPT_MAX_BYTES;

/** Receipt photos are shrunk before upload; small text stays readable at this size. */
export const RECEIPT_UPLOAD = { maxEdge: 1600, quality: 0.8 } as const;

/** Query param holding the expense type tab. */
export const KIND_PARAM = 'type';

/** Query param holding the id of the expense the edit page works on. */
export const EXPENSE_ID_PARAM = 'id';

/** Query param holding the dashboard month to come back to. */
export const MONTH_PARAM = 'month';

export const ERROR_CODES = {
  load: 'EXPENSES_MANAGEMENT_LOAD',
  render: 'EXPENSES_MANAGEMENT_RENDER',
  notFound: 'EXPENSE_NOT_FOUND',
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
  expenseUpdateFailed: {
    title: 'Nie udało się zapisać zmian',
    code: 'EXPENSE_UPDATE_FAILED',
  },
  recurringFailed: {
    title: 'Nie udało się dodać wydatku cyklicznego',
    code: 'RECURRING_CREATE_FAILED',
  },
} as const;
