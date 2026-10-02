import type { Registry } from './registry';
import type { Store } from './store';
import type { Expense, ExpenseId, Month } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: (month: Month) => trigger('[TRIGGER]_LOAD', { month }),
    loadExpenses: () => trigger('[TRIGGER]_LOAD_EXPENSES'),
    updateExpense: (expense: Expense) =>
      trigger('[TRIGGER]_UPDATE_EXPENSE', { expense }),
    removeExpense: (id: ExpenseId) =>
      trigger('[TRIGGER]_DELETE_EXPENSE', { id }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useData: () => store.$data.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useExpenses: () => store.$expenses.use(),
    useCategories: () => store.$categories.use(),
    useExpensesInitializing: () => store.$expensesInitializing.use(),
    useExpensesLoading: () => store.$expensesLoading.use(),
    useExpensesError: () => store.$expensesError.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
