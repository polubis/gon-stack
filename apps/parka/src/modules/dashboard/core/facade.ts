import type { Registry } from './registry';
import type { Store } from './store';
import { postReceiptScan } from '../integration/repository';
import type {
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Month,
  ReceiptDraft,
  Recurring,
  RecurringId,
} from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: (month: Month) => trigger('[TRIGGER]_LOAD', { month }),
    createExpense: (expense: Expense, month: Month) =>
      trigger('[TRIGGER]_CREATE_EXPENSE', { expense, month }),
    updateExpense: (expense: Expense, month: Month) =>
      trigger('[TRIGGER]_UPDATE_EXPENSE', { expense, month }),
    removeExpense: (id: ExpenseId, month: Month) =>
      trigger('[TRIGGER]_DELETE_EXPENSE', { id, month }),
    createLimit: (limit: Limit) => trigger('[TRIGGER]_CREATE_LIMIT', { limit }),
    updateLimit: (limit: Limit) => trigger('[TRIGGER]_UPDATE_LIMIT', { limit }),
    removeLimit: (id: LimitId) => trigger('[TRIGGER]_DELETE_LIMIT', { id }),
    createRecurring: (recurring: Recurring, month: Month) =>
      trigger('[TRIGGER]_CREATE_RECURRING', { recurring, month }),
    updateRecurring: (recurring: Recurring, month: Month) =>
      trigger('[TRIGGER]_UPDATE_RECURRING', { recurring, month }),
    removeRecurring: (id: RecurringId, month: Month) =>
      trigger('[TRIGGER]_DELETE_RECURRING', { id, month }),
    /** One-shot request: the draft goes straight to the form, not the store. */
    scanReceipt: (file: File): Promise<ReceiptDraft> => postReceiptScan(file),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useInitialized: () => store.$initialized.use(),
    useLoading: () => store.$loading.use(),
    useError: () => store.$error.use(),
    useData: () => store.$data.use(),
    useExpenses: () => store.$expenses.use(),
    useCategories: () => store.$categories.use(),
    useLimits: () => store.$limits.use(),
    useRecurring: () => store.$recurring.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
