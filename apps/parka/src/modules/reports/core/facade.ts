import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    useExpenses: () => store.$expenses.use(),
    useCategories: () => store.$categories.use(),
    useRecurring: () => store.$recurring.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
