import { useSortedCategories } from '@/shared/expense-category/sorted';
import type { Registry } from './registry';
import type { Store } from './store';
import type {
  Expense,
  ExpenseId,
  Limit,
  LimitId,
  Period,
  Recurring,
  RecurringId,
} from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: (period: Period) => trigger('[TRIGGER]_LOAD', { period }),
    updateExpense: (expense: Expense, period: Period) =>
      trigger('[TRIGGER]_UPDATE_EXPENSE', { expense, period }),
    removeExpense: (id: ExpenseId, period: Period) =>
      trigger('[TRIGGER]_DELETE_EXPENSE', { id, period }),
    createLimit: (limit: Limit) => trigger('[TRIGGER]_CREATE_LIMIT', { limit }),
    updateLimit: (limit: Limit) => trigger('[TRIGGER]_UPDATE_LIMIT', { limit }),
    removeLimit: (id: LimitId) => trigger('[TRIGGER]_DELETE_LIMIT', { id }),
    updateRecurring: (recurring: Recurring, period: Period) =>
      trigger('[TRIGGER]_UPDATE_RECURRING', { recurring, period }),
    removeRecurring: (id: RecurringId, period: Period) =>
      trigger('[TRIGGER]_DELETE_RECURRING', { id, period }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useInitialized: () => store.$initialized.use(),
    useLoading: () => store.$loading.use(),
    useError: () => store.$error.use(),
    useData: () => store.$data.use(),
    useExpenses: () => store.$expenses.use(),
    useCategories: () => useSortedCategories(store.$categories.use()),
    useLimits: () => store.$limits.use(),
    useRecurring: () => store.$recurring.use(),
    useNotice: () => store.$notice.use(),
    useAvatar: () => store.$avatar.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
