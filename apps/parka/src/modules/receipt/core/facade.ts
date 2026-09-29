import type { Registry } from './registry';
import type { Store } from './store';
import type { NewReceipt } from '../domain/models';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    load: () => trigger('[TRIGGER]_LOAD'),
    save: (receipt: NewReceipt) => trigger('[TRIGGER]_SAVE', { receipt }),
    dismissNotice: () => trigger('[TRIGGER]_DISMISS_NOTICE'),
    useCategories: () => store.$categories.use(),
    useInitializing: () => store.$initializing.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useSaving: () => store.$saving.use(),
    useSaved: () => store.$saved.use(),
    useNotice: () => store.$notice.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
