import type { Registry } from './registry';
import type { Store } from './store';
import type { Recurring } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    update: (recurring: Recurring) =>
      trigger('[TRIGGER]_UPDATE', { recurring }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useRecurring: () => store.$recurring.use(),
    useCategories: () => store.$categories.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
