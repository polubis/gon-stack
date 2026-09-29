import type { Registry } from './registry';
import type { Store } from './store';
import type { Expense, ExpenseId } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    update: (expense: Expense) => trigger('[TRIGGER]_UPDATE', { expense }),
    remove: (id: ExpenseId) => trigger('[TRIGGER]_DELETE', { id }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useExpenses: () => store.$expenses.use(),
    useCategories: () => store.$categories.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
